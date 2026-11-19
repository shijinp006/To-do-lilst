import { useState } from "react";
import Card from "./Card.jsx";
import { makeTask, STATUSES } from "../lib/report.js";

const CHIP = {
  done: { label: "✅ Done", cls: "bg-done-soft text-done" },
  pending: { label: "⏳ Pending", cls: "bg-pend-soft text-pend" },
  both: { label: "🔁 Done & continue", cls: "bg-both-soft text-both" },
};

function Chip({ status, children, ...props }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${CHIP[status].cls}`} {...props}>
      {children ?? CHIP[status].label}
    </span>
  );
}

function TaskRow({ task, onChange, onRemove }) {
  const cycle = () => onChange({ ...task, status: STATUSES[(STATUSES.indexOf(task.status) + 1) % STATUSES.length] });
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-[#dde3e0] bg-[#f3f5f4] py-2 pl-3 pr-2 sm:grid-cols-[1fr_auto_auto]">
      <input
        type="text"
        id={`task-${task.id}`}
        aria-label="Task"
        value={task.text}
        onChange={(e) => onChange({ ...task, text: e.target.value })}
        className="w-full min-w-0 bg-transparent py-1 focus:outline-none"
      />
      <button type="button" onClick={cycle} title="Change status" className="col-span-2 justify-self-start rounded-full focus-visible:outline-2 focus-visible:outline-brand sm:col-span-1 sm:row-start-1 sm:col-start-2">
        <Chip status={task.status} />
      </button>
      <button type="button" onClick={onRemove} aria-label="Remove task" className="row-start-1 col-start-2 rounded-lg px-2 py-1 text-lg text-[#5c6964] hover:text-pend sm:col-start-3">
        ✕
      </button>
    </li>
  );
}

export default function TasksCard({ tasks, setTasks }) {
  const [draft, setDraft] = useState("");
  const add = (e) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v) return;
    setTasks([...tasks, makeTask(v, "pending")]);
    setDraft("");
  };

  return (
    <Card step="3" title="Tasks">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#5c6964]">
        Tap a status to change it:
        <Chip status="done">✅ Done → today</Chip>
        <Chip status="pending">⏳ Pending → next day</Chip>
        <Chip status="both">🔁 Done & continue → both</Chip>
      </div>
      <ul className="flex flex-col gap-2">
        {tasks.length ? (
          tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onChange={(nt) => setTasks(tasks.map((x) => (x.id === t.id ? nt : x)))}
              onRemove={() => setTasks(tasks.filter((x) => x.id !== t.id))}
            />
          ))
        ) : (
          <li className="py-2 text-sm text-[#5c6964]">No tasks yet. Take a photo or add one by hand.</li>
        )}
      </ul>
      <form onSubmit={add} className="flex gap-2">
        <input
          type="text"
          id="add-task"
          placeholder="Add a task by hand"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-[#dde3e0] bg-[#f3f5f4] px-3 py-2 focus:outline-2 focus:outline-brand"
        />
        <button type="submit" className="rounded-xl border border-[#dde3e0] bg-white px-4 py-2 font-semibold hover:border-brand">
          Add
        </button>
      </form>
    </Card>
  );
}
