import { useState } from "react";
import Card from "./Card.jsx";
import { makeTask, shrinkImage, STATUSES } from "../lib/report.js";

const btn =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand";

export default function PhotoCard({ onTasks }) {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const say = (text, error = false) => setStatus({ text, error });

  async function handleFile(e) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file || busy) return;
    setBusy(true);
    try {
      say("Preparing photo…");
      const { base64, preview } = await shrinkImage(file);
      setPreview(preview);
      say("Reading your to-do list…");
      const res = await fetch("/api/read-todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: "image/jpeg" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Server error (${res.status}).`);

      const tasks = (data.tasks || [])
        .filter((t) => t?.text?.trim())
        .map((t) => makeTask(t.text.trim(), STATUSES.includes(t.status) ? t.status : "pending"));
      if (!tasks.length) {
        say("No tasks found in this photo. Try a clearer photo, or add tasks by hand.", true);
        return;
      }
      onTasks(tasks);
      const done = tasks.filter((t) => t.status !== "pending").length;
      const next = tasks.filter((t) => t.status !== "done").length;
      say(`Read ${tasks.length} tasks: ${done} done, ${next} for the next day. Check them below.`);
    } catch (err) {
      say(`${err.message} You can also add tasks by hand.`, true);
    } finally {
      setBusy(false);
      input.value = "";
    }
  }

  return (
    <Card step="1" title="To-do photo">
      <div className="grid gap-3.5 sm:grid-cols-[120px_1fr] sm:items-start">
        <div className="grid aspect-video w-full place-items-center overflow-hidden rounded-xl border border-dashed border-[#dde3e0] bg-[#f3f5f4] text-center text-xs text-[#5c6964] sm:aspect-[3/4]">
          {preview ? <img src={preview} alt="To-do photo" className="h-full w-full object-cover" /> : "No photo yet"}
        </div>
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex flex-wrap gap-2.5">
            <label className={`${btn} border-brand bg-brand text-white ${busy ? "pointer-events-none opacity-50" : "hover:brightness-110"}`}>
              📷 Take photo
              {/* capture opens the rear camera directly on phones */}
              <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFile} disabled={busy} />
            </label>
            <label className={`${btn} border-[#dde3e0] bg-white ${busy ? "pointer-events-none opacity-50" : "hover:border-brand"}`}>
              🖼️ Upload photo
              <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={busy} />
            </label>
          </div>
          <p className="text-sm text-[#5c6964]">
            Write each task with a status: <b>done</b>, <b>complete</b> or a ✓ tick goes to today. <b>pending</b> or no tick goes to the next work plan.
          </p>
          <p className={`min-h-5 text-sm ${status.error ? "text-pend" : "text-[#5c6964]"}`} aria-live="polite">
            {busy && <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent align-[-1px]" />}
            {status.text}
          </p>
        </div>
      </div>
    </Card>
  );
}
