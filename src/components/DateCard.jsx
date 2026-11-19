import Card from "./Card.jsx";
import { DAYS, fmtDate, nextWorkDay, parseISO } from "../lib/report.js";

export default function DateCard({ iso, onChange }) {
  const d = parseISO(iso);
  const n = nextWorkDay(d);
  return (
    <Card step="2" title="Date">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          type="date"
          id="report-date"
          value={iso}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="min-w-0 rounded-xl border border-[#dde3e0] bg-[#f3f5f4] px-3 py-2 focus:outline-2 focus:outline-brand"
        />
        <span className="text-sm text-[#5c6964]">
          {DAYS[d.getDay()]} · next work day{" "}
          <b className="text-[#17201c]">
            {DAYS[n.getDay()]}, {fmtDate(n)}
          </b>
        </span>
      </div>
    </Card>
  );
}
