import { useMemo, useState } from "react";
import PhotoCard from "./components/PhotoCard.jsx";
import DateCard from "./components/DateCard.jsx";
import TasksCard from "./components/TasksCard.jsx";
import ReportCard from "./components/ReportCard.jsx";
import { buildMessage, makeTask, parseISO, toISO } from "./lib/report.js";

export default function App() {
  // Example tasks from the shared format; replaced as soon as a photo is read.
  const [tasks, setTasks] = useState(() => [
    makeTask("boat on page", "both"),
    makeTask("off page", "done"),
    makeTask("press d seo", "pending"),
  ]);
  const [iso, setIso] = useState(() => toISO(new Date()));
  const message = useMemo(() => buildMessage(tasks, parseISO(iso)), [tasks, iso]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-12 pt-6 sm:gap-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-balance">Daily Work Report</h1>
        <p className="mt-1 text-[#5c6964]">Photo of your to-do list in, WhatsApp-ready report out.</p>
      </header>
      <PhotoCard onTasks={setTasks} />
      <DateCard iso={iso} onChange={setIso} />
      <TasksCard tasks={tasks} setTasks={setTasks} />
      <ReportCard message={message} />
    </main>
  );
}
