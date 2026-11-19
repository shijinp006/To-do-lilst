# Daily Work Report

Take a photo of your to-do list → Gemini reads it → you get a dated report ready to share on WhatsApp.

- **done / complete / ✓ tick** → Today's Work Completed
- **pending / no tick** → Tomorrow's Work Plan
- **Done & continue** → both lists
- Saturday's plan is titled **Monday's Work Plan** (Sunday is a holiday)

Built with React + Vite + Tailwind CSS v4. Photo reading runs in a Vercel function (`api/read-todo.js`) that calls Google Gemini through the Vercel AI SDK (`ai` + `@ai-sdk/google`), so the API key never reaches the browser.

## Run locally

```bash
npm install
cp .env.example .env   # then put your Gemini key in .env
npm run dev
```

`npm run dev` also serves `/api/read-todo`, so photo reading works locally.

## Deploy to Vercel

1. Push this folder to a GitHub repo and import it at vercel.com/new (or run `npx vercel`).
2. In **Project → Settings → Environment Variables**, add `GOOGLE_GENERATIVE_AI_API_KEY` (free key from https://aistudio.google.com/apikey). Optionally add `GEMINI_MODEL` (comma-separated, tried in order; default `gemini-3.8-flash,gemini-3.1-flash-lite`).
3. Deploy. `vercel.json` sets the Vite build, the `dist` output, the SPA rewrite and a 60-second limit for the photo function.

## Files

| Path | What it does |
|---|---|
| `api/read-todo.js` | Vercel function: sends the photo to Gemini, returns `{ tasks: [{ text, status }] }` |
| `src/lib/report.js` | Dates, next work day, message format, photo resizing |
| `src/components/PhotoCard.jsx` | Take photo (opens camera on phones) / upload |
| `src/components/DateCard.jsx` | Report date + next work day |
| `src/components/TasksCard.jsx` | Edit tasks, tap to change status |
| `src/components/ReportCard.jsx` | Preview, Share on WhatsApp, Copy, More apps |
| `vercel.json` | Vercel build and function settings |
