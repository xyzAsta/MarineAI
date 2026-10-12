const WAVE = "M0,60 C240,110 480,10 720,60 C960,110 1200,10 1440,60 C1680,110 1920,10 2160,60 C2400,110 2640,10 2880,60 L2880,120 L0,120 Z";

function Wave({ className, duration, delay = "0s" }) {
  return (
    <div className="wave-tide absolute inset-x-0 bottom-0 h-24 overflow-hidden sm:h-32" style={{ animationDelay: delay }}>
      <svg viewBox="0 0 2880 120" preserveAspectRatio="none"
        className={`wave-slide h-full w-[200%] ${className}`} style={{ animationDuration: duration }}>
        <path d={WAVE} fill="currentColor" />
      </svg>
    </div>
  );
}

export default function WaveBackground({ image = "/images/hb.jpeg", children, className = "" }) {
  return (
    <section className={`relative isolate overflow-hidden bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-800 ${className}`}>
      <div className="animate-kenburns absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/70 dark:from-slate-950/85 dark:via-slate-950/60 dark:to-slate-950/90" />

      {children}

      {/* three wave layers; the front one matches the page background */}
      <Wave className="text-white/25 dark:text-sky-300/10" duration="30s" delay="-2s" />
      <Wave className="text-white/50 dark:text-sky-400/15" duration="22s" delay="-4s" />
      <Wave className="text-slate-50 dark:text-slate-950" duration="16s" />
    </section>
  );
}