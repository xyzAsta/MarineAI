export default function Logo({ size = 36, showText = true }) {
  return (
    <span className="group flex items-center gap-2.5">
      <span
        className="grid place-items-center rounded-xl bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500 shadow-lg shadow-sky-500/30 ring-1 ring-white/30 transition group-hover:scale-105 group-hover:rotate-3"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 48 48" width={size * 0.72} height={size * 0.72} fill="none"
          stroke="white" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {/* AI scan corners */}
          <path strokeWidth="2.6"
            d="M12 18v-3a3 3 0 0 1 3-3h3 M30 12h3a3 3 0 0 1 3 3v3 M36 30v3a3 3 0 0 1-3 3h-3 M18 36h-3a3 3 0 0 1-3-3v-3" />
          {/* detection dot */}
          <circle cx="24" cy="19.5" r="2.6" fill="white" stroke="none" />
          {/* waves */}
          <g className="logo-wave">
            <path strokeWidth="2.6" d="M14 26.5q3.5-3.5 7 0t7 0t6 0" />
            <path strokeWidth="2.6" opacity="0.65" d="M14 32q3.5-3.5 7 0t7 0t6 0" />
          </g>
        </svg>
      </span>
      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          Marine<span className="bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">AI</span>
        </span>
      )}
    </span>
  );
}