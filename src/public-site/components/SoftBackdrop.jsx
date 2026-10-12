export default function SoftBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-950 dark:to-sky-950"
    >
      <div className="caustics absolute inset-0 opacity-40 dark:opacity-30" />
      <div className="animate-float absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div
        className="animate-float absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl"
        style={{ animationDelay: "-3s" }}
      />
    </div>
  );
}