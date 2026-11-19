import { generateText, Output, APICallError, NoOutputGeneratedError, RetryError } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Gemini models to try, best first. Override with GEMINI_MODEL (comma-separated).
const MODELS = (process.env.GEMINI_MODEL || "gemini-3.8-flash,gemini-3.1-flash-lite")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const TodoSchema = z.object({
  tasks: z.array(
    z.object({
      text: z.string(),
      status: z.enum(["done", "pending", "both"]),
    }),
  ),
});

const PROMPT = `The attached image is a photo or screenshot of a to-do list. It may be handwritten, in English or Malayalam/Manglish.
Extract every task and its status.
Status rules:
- "done", "complete", "completed", "finished", a tick mark ✓/✔/☑, or a struck-through item → "done"
- "pending", "not done", an empty box ☐, a cross ✗, no tick, or no status at all → "pending"
- A task marked done that also says continue / ongoing / tomorrow too → "both"
Keep each task's wording as written; fix only obvious spelling. Leave out the status word itself, headings, dates and bullet symbols.
Only include tasks whose words you can actually see in the image. Never invent, guess or give example tasks.
If the image is blank, unreadable, or has no to-do list, return {"tasks": []}.`;

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return res.status(500).json({ error: "GOOGLE_GENERATIVE_AI_API_KEY is not set on the server." });
  }

  const { image, mediaType = "image/jpeg" } = req.body || {};
  if (typeof image !== "string" || !image || !MEDIA_TYPES.includes(mediaType)) {
    return res.status(400).json({ error: "Send a JPEG, PNG, WebP or GIF image as base64." });
  }

  const messages = [
    {
      role: "user",
      content: [
        { type: "file", mediaType, data: image },
        { type: "text", text: PROMPT },
      ],
    },
  ];

  // Try each model in turn; move on when one is busy, missing or too slow.
  let lastError;
  for (let i = 0; i < MODELS.length; i++) {
    const isLast = i === MODELS.length - 1;
    try {
      const { output, finishReason } = await generateText({
        model: google(MODELS[i]),
        maxOutputTokens: 8000,
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(isLast ? 30000 : 20000),
        output: Output.object({ schema: TodoSchema }),
        messages,
      });
      if (finishReason === "content-filter") {
        return res.status(422).json({ error: "This photo could not be read. Try another photo." });
      }
      return res.status(200).json({ ...output, model: MODELS[i] });
    } catch (error) {
      lastError = error;
      const status = APICallError.isInstance(error) ? error.statusCode : undefined;
      const tryNext = !status || [404, 429, 500, 503, 504].includes(status);
      if (!tryNext || isLast) break;
      console.warn(`Gemini model ${MODELS[i]} failed (${status ?? error.name}); trying ${MODELS[i + 1]}`);
    }
  }

  return sendError(res, lastError);
}

function sendError(res, error) {
  if (error?.name === "TimeoutError" || error?.name === "AbortError") {
    return res.status(504).json({ error: "Gemini is busy and did not answer in time. Try again in a minute." });
  }
  if (NoOutputGeneratedError.isInstance(error)) {
    return res.status(502).json({ error: "Could not understand the list in this photo." });
  }
  const apiError = RetryError.isInstance(error) ? error.lastError : error;
  if (APICallError.isInstance(apiError)) {
    const s = apiError.statusCode;
    if (s === 400 && /api key/i.test(apiError.message)) return res.status(500).json({ error: "The server's API key is invalid." });
    if (s === 400) return res.status(400).json({ error: "The photo was rejected. Try a smaller or clearer photo." });
    if (s === 404) return res.status(500).json({ error: `No Gemini model in "${MODELS.join(", ")}" is available. Set GEMINI_MODEL to a model listed in Google AI Studio.` });
    if (s === 401 || s === 403) return res.status(500).json({ error: "The server's API key is invalid." });
    if (s === 429) return res.status(429).json({ error: "Free limit reached for now. Wait a minute and try again." });
    if (s === 503) return res.status(503).json({ error: "Gemini is busy right now. Try again in a minute." });
    return res.status(502).json({ error: `Gemini API error (${s ?? "network"}). Try again.` });
  }
  console.error(error);
  return res.status(500).json({ error: "Something went wrong reading the photo." });
}
