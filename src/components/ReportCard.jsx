import { useEffect, useRef, useState } from "react";
import Card from "./Card.jsx";

export default function ReportCard({ message }) {
  const [note, setNote] = useState("");
  const pre = useRef(null);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(""), 2500);
    return () => clearTimeout(t);
  }, [note]);

  const selectText = () => {
    const range = document.createRange();
    range.selectNodeContents(pre.current);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    setNote("Text selected. Press Ctrl+C to copy.");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setNote("Copied");
    } catch {
      selectText();
    }
  };

  // On phones, the native share sheet lists WhatsApp and every other app.
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const share = async () => {
    try {
      await navigator.share({ text: message });
    } catch {
      /* viewer closed the share sheet */
    }
  };

  return (
    <Card step="4" title="Report">
      <pre ref={pre} className="m-0 whitespace-pre-wrap break-words rounded-xl bg-brand-soft p-3.5 font-mono text-sm">
        {message}
      </pre>
      <div className="flex flex-wrap items-center gap-2.5">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-wa px-4 py-2.5 font-semibold text-white hover:brightness-110"
        >
          Share on WhatsApp
        </a>
        <button type="button" onClick={copy} className="rounded-xl border border-[#dde3e0] bg-white px-4 py-2.5 font-semibold hover:border-brand">
          Copy text
        </button>
        {canShare && (
          <button type="button" onClick={share} className="rounded-xl border border-[#dde3e0] bg-white px-4 py-2.5 font-semibold hover:border-brand">
            More apps…
          </button>
        )}
        <span className="text-sm text-[#5c6964]" aria-live="polite">{note}</span>
      </div>
    </Card>
  );
}
