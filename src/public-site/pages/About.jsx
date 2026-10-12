
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Target,
  Eye,
  Users,
  ArrowRight,
  ScanSearch,
  Layers,
  ShieldAlert,
  ListChecks,
  Activity,
  Waves,
  ChevronRight,
} from "lucide-react";
import SoftBackdrop from "../components/SoftBackdrop";

const cards = [
  {
    icon: Target,
    title: "Our Mission",
    text: "Help communities detect marine pollution, assess risks, and prioritize cleanup.",
    color: "sky",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "Build cleaner coastlines through targeted, measurable, data-driven action.",
    color: "slate",
  },
  {
    icon: Users,
    title: "Who It Serves",
    text: "Support NGOs, researchers, and citizens in reporting and reducing marine debris.",
    color: "teal",
  },
];

const pipeline = [
  { icon: ScanSearch, label: "Detect" },
  { icon: Layers, label: "Condition" },
  { icon: ShieldAlert, label: "Risk" },
  { icon: ListChecks, label: "Prioritize" },
  { icon: Activity, label: "Monitor" },
];

const styles = {
  sky: {
    icon: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300",
    accent: "from-sky-500 to-cyan-400",
    glow: "bg-sky-400/10",
  },
  slate: {
    icon: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-100",
    accent: "from-slate-400 to-slate-200",
    glow: "bg-slate-400/10",
  },
  teal: {
    icon: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300",
    accent: "from-teal-500 to-emerald-400",
    glow: "bg-teal-400/10",
  },
};

export default function About() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.4,
        delay: reduceMotion ? 0 : i * 0.06,
      },
    }),
  };

  return (
    <main className="relative isolate flex min-h-full flex-1 flex-col overflow-hidden text-slate-900 dark:text-white">
      <SoftBackdrop />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* Compact hero */}
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          className="text-center"
        >
         

          <h1 className="mx-auto max-w-4xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            From seeing pollution to{" "}
            <span className="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
              acting on it
            </span>
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-slate-600 dark:text-slate-400 sm:text-sm sm:leading-6">
            Detect marine debris, assess environmental risk, and help teams
            decide what to clean first.
          </p>
        </motion.div>

        {/* Mission, vision and community */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
          {cards.map(({ icon: Icon, title, text, color }, i) => {
            const theme = styles[color];

            return (
              <motion.article
                key={title}
                variants={reveal}
                custom={i + 1}
                initial="hidden"
                animate="show"
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-lg hover:shadow-sky-500/10 dark:border-slate-800 dark:bg-slate-900/75 lg:p-5"
              >
                <div
                  aria-hidden="true"
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${theme.glow} blur-2xl`}
                />

                <div className="relative flex items-center gap-3">
                  <div
                    className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl ${theme.icon}`}
                  >
                    {color === "sky" && (
                      <motion.span
                        aria-hidden="true"
                        animate={reduceMotion ? undefined : { rotate: 360 }}
                        transition={{
                          duration: 12,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-1 rounded-full border border-dashed border-sky-400/50"
                      />
                    )}

                    <motion.div
                      animate={
                        reduceMotion
                          ? undefined
                          : color === "slate"
                            ? { scaleY: [1, 0.92, 1] }
                            : color === "teal"
                              ? { y: [0, -1.5, 0] }
                              : { scale: [1, 1.05, 1] }
                      }
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut",
                      }}
                    >
                      <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
                    </motion.div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold sm:text-base">{title}</h2>
                    <span
                      className={`mt-1 block h-0.5 w-8 rounded-full bg-gradient-to-r ${theme.accent}`}
                    />
                  </div>
                </div>

                <p className="relative mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400 sm:text-sm">
                  {text}
                </p>
              </motion.article>
            );
          })}
        </div>

        {/* Connected AI workflow */}
        <motion.section
          variants={reveal}
          custom={4}
          initial="hidden"
          animate="show"
          className="mt-4 rounded-xl border border-slate-200/80 bg-white/75 p-3 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/65 sm:mt-5 sm:p-4"
          aria-labelledby="workflow-heading"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2
              id="workflow-heading"
              className="text-sm font-bold sm:text-base"
            >
              From detection to action
            </h2>
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-sky-600 dark:bg-sky-950/70 dark:text-sky-300">
              AI WORKFLOW
            </span>
          </div>

          {/* Arrows connect each step on all screen sizes */}
          <div className="flex items-center justify-between gap-0.5 sm:gap-2">
            {pipeline.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex min-w-0 flex-1 items-center"
              >
                <motion.div
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : 0.3 + i * 0.08,
                  }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-0.5 py-2 text-center transition-colors hover:bg-sky-50/80 dark:hover:bg-slate-800/80 sm:flex-row sm:justify-center sm:gap-2 sm:px-2"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-50 to-teal-50 text-sky-600 ring-1 ring-sky-100 dark:from-sky-950/70 dark:to-teal-950/70 dark:text-sky-300 dark:ring-sky-900 sm:h-9 sm:w-9">
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>

                  <span className="text-[10px] font-semibold leading-tight text-slate-700 dark:text-slate-300 sm:text-xs">
                    {label}
                  </span>
                </motion.div>

                {i < pipeline.length - 1 && (
                  <motion.div
                    initial={
                      reduceMotion ? false : { opacity: 0, scale: 0.7 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.25,
                      delay: reduceMotion ? 0 : 0.45 + i * 0.08,
                    }}
                    className="flex shrink-0 items-center justify-center text-sky-500 dark:text-teal-400"
                    aria-hidden="true"
                  >
                    <ChevronRight
                      size={17}
                      strokeWidth={2.5}
                      className="sm:hidden"
                    />
                    <ArrowRight
                      size={19}
                      strokeWidth={2}
                      className="hidden sm:block"
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Actions */}
        <motion.div
          variants={reveal}
          custom={5}
          initial="hidden"
          animate="show"
          className="mt-5 flex flex-col justify-center gap-2 sm:flex-row"
        >
          <Link
            to="/signup"
            className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            Get started
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>

          <Link
            to="/contact"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white/70 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
          >
            Contact us
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
