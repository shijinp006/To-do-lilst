export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const STATUSES = ["done", "pending", "both"];

const pad = (n) => String(n).padStart(2, "0");
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fmtDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const parseISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Sunday is a holiday: Saturday's next work day is Monday.
export function nextWorkDay(d) {
  const n = new Date(d);
  n.setDate(n.getDate() + (d.getDay() === 6 ? 2 : 1));
  if (n.getDay() === 0) n.setDate(n.getDate() + 1);
  return n;
}

export function planHeading(d) {
  const next = nextWorkDay(d);
  const gap = Math.round((next - d) / 86400000);
  return gap === 1 ? "Tomorrow’s Work Plan" : `${DAYS[next.getDay()]}’s Work Plan`;
}

export function buildMessage(tasks, date) {
  const valid = tasks.filter((t) => t.text.trim());
  const today = valid.filter((t) => t.status !== "pending");
  const next = valid.filter((t) => t.status !== "done");
  const list = (arr) => (arr.length ? arr.map((t) => `• ${t.text.trim()}`).join("\n") : "• —");
  return [
    "📋 Daily To-Do Report & Next-Day Work Plan",
    "",
    `📅 Date: ${fmtDate(date)}`,
    "",
    "✅ Today’s Work Completed:",
    list(today),
    "",
    `🎯 ${planHeading(date)}:`,
    list(next),
  ].join("\n");
}

let nextId = 1;
export const makeTask = (text, status = "pending") => ({ id: nextId++, text, status });

// Shrinks a photo so the upload stays small and fast; returns base64 JPEG + a preview URL.
export async function shrinkImage(file, max = 1600) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("This file is not an image the browser can open."));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return { base64: dataUrl.split(",")[1], preview: dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}
