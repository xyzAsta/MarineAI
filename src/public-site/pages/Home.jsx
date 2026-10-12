import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  ScanSearch,
  Layers3,
  ShieldCheck,
  ListChecks,
  MapPinned,
  TrendingUp,
  ArrowRight,
  Upload,
  CheckCircle2,
  ImagePlus,
} from "lucide-react";

import WaveBackground from "../components/WaveBackground";

/* ---------------------------------------
   Animation settings
---------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: "easeOut" },
  },
};

const fade = {
  hidden: { opacity: 0, y: 15 },
  show: (custom) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: custom * 0.15, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const viewport = {
  once: true,
  amount: 0.15,
};

const features = [
  {
    icon: Camera,
    title: "Debris Detection",
    text: "YOLO11 finds plastic and other debris in images and video, with bounding boxes and confidence.",
    color: "sky",
    iconMotion: { rotate: [0, -4, 0] },
  },
  {
    icon: Layers3,
    title: "Condition Analysis",
    text: "Each object is classified as intact, weathered, damaged or fragmented.",
    color: "violet",
    iconMotion: { y: [0, -2, 0] },
  },
  {
    icon: ShieldCheck,
    title: "Environmental Risk",
    text: "An explainable 0 to 100 risk score based on material, wildlife hazard and location.",
    color: "amber",
    iconMotion: { scale: [1, 1.06, 1] },
  },
  {
    icon: ListChecks,
    title: "Cleanup Priority",
    text: "Low to Critical priorities with a clear recommended action for each site.",
    color: "emerald",
    iconMotion: { x: [0, 2, 0] },
  },
  {
    icon: MapPinned,
    title: "Maps and Heatmaps",
    text: "See pollution hotspots and sensitive marine zones on an interactive map.",
    color: "rose",
    iconMotion: { y: [0, -2, 0] },
  },
  {
    icon: TrendingUp,
    title: "Impact Monitoring",
    text: "Compare before and after cleanup to measure real risk reduction.",
    color: "cyan",
    iconMotion: { y: [0, -3, 0] },
  },
];

const iconColors = {
  sky: {
    icon: "text-sky-700 dark:text-sky-300",
    background: "bg-sky-50 dark:bg-sky-950/60",
    border: "group-hover:border-sky-300 dark:group-hover:border-sky-800",
    glow: "bg-sky-400/10",
  },
  violet: {
    icon: "text-violet-700 dark:text-violet-300",
    background: "bg-violet-50 dark:bg-violet-950/60",
    border: "group-hover:border-violet-300 dark:group-hover:border-violet-800",
    glow: "bg-violet-400/10",
  },
  amber: {
    icon: "text-amber-700 dark:text-amber-300",
    background: "bg-amber-50 dark:bg-amber-950/60",
    border: "group-hover:border-amber-300 dark:group-hover:border-amber-800",
    glow: "bg-amber-400/10",
  },
  emerald: {
    icon: "text-emerald-700 dark:text-emerald-300",
    background: "bg-emerald-50 dark:bg-emerald-950/60",
    border: "group-hover:border-emerald-300 dark:group-hover:border-emerald-800",
    glow: "bg-emerald-400/10",
  },
  rose: {
    icon: "text-rose-700 dark:text-rose-300",
    background: "bg-rose-50 dark:bg-rose-950/60",
    border: "group-hover:border-rose-300 dark:group-hover:border-rose-800",
    glow: "bg-rose-400/10",
  },
  cyan: {
    icon: "text-cyan-700 dark:text-cyan-300",
    background: "bg-cyan-50 dark:bg-cyan-950/60",
    border: "group-hover:border-cyan-300 dark:group-hover:border-cyan-800",
    glow: "bg-cyan-400/10",
  },
};

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload media",
    description: "Choose an image or video.",
    color: "sky",
  },
  {
    icon: ScanSearch,
    number: "02",
    title: "AI detects debris",
    description: "Identify visible waste and objects.",
    color: "violet",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Risk is scored",
    description: "Evaluate environmental risk.",
    color: "amber",
  },
  {
    icon: CheckCircle2,
    number: "04",
    title: "Clean up and track",
    description: "Review priorities and monitor impact.",
    color: "emerald",
  },
];

const stepColors = {
  sky: "text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300",
  violet: "text-violet-700 bg-violet-50 dark:bg-violet-950/60 dark:text-violet-300",
  amber: "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300",
  emerald: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
};

/* ---------------------------------------
   Reusable section heading
---------------------------------------- */

function SectionHead({ eyebrow, title, text }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={viewport}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300 sm:text-sm">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
        {title}
      </h2>

      {text && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base sm:leading-7">
          {text}
        </p>
      )}
    </motion.div>
  );
}

/* ---------------------------------------
   Feature card
---------------------------------------- */

function FeatureCard({ feature, reduceMotion }) {
  const Icon = feature.icon;
  const colors = iconColors[feature.color];

  return (
    <motion.article
      variants={fadeUp}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-[border-color,box-shadow] duration-300 hover:shadow-lg hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20 sm:p-6 ${colors.border}`}
    >
      {/* Soft hover glow */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 -z-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${colors.glow}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <motion.div
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${colors.background} ${colors.icon}`}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  scale: 1.08,
                  rotate: -3,
                  transition: { duration: 0.2 },
                }
          }
        >
          <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
        </motion.div>

        <span className="text-xs font-semibold tracking-wider text-slate-300 dark:text-slate-600">
          {feature.title === "Debris Detection"
            ? "01"
            : feature.title === "Condition Analysis"
              ? "02"
              : feature.title === "Environmental Risk"
                ? "03"
                : feature.title === "Cleanup Priority"
                  ? "04"
                  : feature.title === "Maps and Heatmaps"
                    ? "05"
                    : "06"}
        </span>
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white sm:text-lg">
        {feature.title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {feature.text}
      </p>

     
    </motion.article>
  );
}

/* ---------------------------------------
   Home page
---------------------------------------- */

export default function Home() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <WaveBackground className="min-h-screen pt-16">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 pb-40 text-center sm:px-6">
            <motion.h1
              variants={fade}
              custom={1}
              initial="hidden"
              animate="show"
              className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl"
            >
              Detect. Assess.{" "}
              <span className="bg-gradient-to-r from-sky-300 to-teal-200 bg-clip-text text-transparent">
                Clean our oceans.
              </span>
            </motion.h1>

            <motion.p
              variants={fade}
              custom={2}
              initial="hidden"
              animate="show"
              className="mt-6 max-w-2xl text-base text-slate-100/90 sm:text-lg"
            >
              Marine AI turns photos and videos of polluted shores into risk scores, cleanup priorities and measurable impact.
            </motion.p>

            <motion.div
              variants={fade}
              custom={3}
              initial="hidden"
              animate="show"
              className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
            >
              <Link
                to="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-sky-700 shadow-xl transition hover:-translate-y-0.5 sm:w-auto"
              >
                Get started free
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#platform"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:w-auto"
              >
                Learn more
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-medium text-white/80 sm:text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <Camera size={16} aria-hidden="true" />
                Image & video analysis
              </span>

              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} aria-hidden="true" />
                Risk assessment
              </span>

              <span className="inline-flex items-center gap-2">
                <MapPinned size={16} aria-hidden="true" />
                Cleanup priorities
              </span>
            </motion.div>
          </div>
        </WaveBackground>
      </section>

      {/* PLATFORM */}
      <section
        id="platform"
        className="scroll-mt-16 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHead
            eyebrow="Platform"
            title="From detection to impact"
            text="Everything needed to understand marine debris and prioritize cleanup."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
          >
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                reduceMotion={reduceMotion}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section
        id="workflow"
        className="scroll-mt-16 border-y border-slate-200 bg-slate-50 px-4 py-14 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHead
            eyebrow="Workflow"
            title="How it works"
            text="Four clear steps from media upload to cleanup monitoring."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="relative mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.article
                  key={step.number}
                  variants={fadeUp}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="group relative flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-sky-800 sm:items-start sm:p-5 lg:flex-col lg:items-start"
                >
                  <div
                    className={`grid size-12 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${stepColors[step.color]}`}
                  >
                    <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold tracking-[0.15em] text-slate-400">
                      STEP {index + 1}
                    </p>

                    <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <ArrowRight
                      size={16}
                      className="hidden shrink-0 text-slate-300 dark:text-slate-600 lg:absolute lg:-right-5 lg:top-9 lg:z-10 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-700 px-5 py-10 text-center shadow-xl shadow-sky-950/10 sm:px-10 sm:py-12"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-white/10 blur-3xl"
            animate={
              reduceMotion ? undefined : { scale: [1, 1.15, 1] }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative">
            <ImagePlus
              size={30}
              className="mx-auto text-cyan-100"
              strokeWidth={1.6}
              aria-hidden="true"
            />

            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              Ready to protect our coastlines?
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
              Create an account to explore marine debris analysis and cleanup
              prioritization.
            </p>

            <Link
              to="/signup"
              className="group mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-sky-800 transition-colors hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            >
              Create account
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}