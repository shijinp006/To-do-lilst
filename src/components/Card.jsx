export default function Card({ step, title, children }) {
  return (
    <section className="flex min-w-0 flex-col gap-3.5 rounded-2xl border border-[#dde3e0] bg-white p-4 sm:p-5">
      <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[#5c6964]">
        {step} · {title}
      </h2>
      {children}
    </section>
  );
}
