import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Menu, X } from "lucide-react";

/*
  false -> About / Contact open their own one-screen pages
  true  -> on the Home page, About / Contact smooth-scroll to the sections
*/
const CLICK_SCROLLS_ON_HOME = false;

const links = [
  { key: "home", to: "/", label: "Home" },
  { key: "about", to: "/about", label: "About" },
  { key: "contact", to: "/contact", label: "Contact" },
];

const SECTION_IDS = ["home"];

const menuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.04, 0.62, 0.23, 0.98],
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

/* Shared button styles */
const outlineBtn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700";

const gradientBtn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/40 active:translate-y-0";

/* ---------- component ---------- */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("home");
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  // Scroll-spy: only runs on the Home page
  useEffect(() => {
    if (pathname !== "/") return;

    const onScroll = () => {
      const probe = window.innerHeight * 0.35;
      let current = "home";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const activeKey =
    pathname === "/" ? section :
    pathname === "/about" ? "about" :
    pathname === "/contact" ? "contact" : null;

  const handleClick = (e, l) => {
    setOpen(false);
    if (pathname !== "/") return;

    if (l.key === "home") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (CLICK_SCROLLS_ON_HOME) {
      e.preventDefault();
      document.getElementById(l.key)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isDark = theme === "dark";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-900/80">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          aria-label="Marine AI home"
          onClick={(e) => pathname === "/" && (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
          className="group flex items-center gap-3.5 py-2 focus:outline-none"
        >
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, 1, -1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-teal-500/10 p-0.5 shadow-md shadow-sky-500/15"
          >
            <img
              src="/images/svg.png"
              alt="Marine AI Logo"
              className="h-10 w-10 rounded-xl object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </motion.div>
          <div className="flex flex-col">
            <span className="flex items-center text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Marine
              <span className="ml-0.5 bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">AI</span>
            </span>
            <span className="-mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Ocean Intel
            </span>
          </div>
        </Link>

        {/* Desktop links (pill) */}
        <div className="relative isolate hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/70 p-1.5 shadow-inner backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-800/60 md:flex">
          {links.map((l) => {
            const active = activeKey === l.key;
            return (
              <Link
                key={l.key}
                to={l.to}
                onClick={(e) => handleClick(e, l)}
                className={`relative flex items-center rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 ${
                  active
                    ? "font-semibold text-sky-600 dark:text-sky-300"
                    : "text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white shadow-sm dark:bg-slate-900"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2.5">
          {/* Animated theme toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 dark:border-slate-600 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "sun" : "moon"}
                initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="grid place-items-center"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <Link to="/login" className={`${outlineBtn} hidden md:inline-flex`}>
            Log in
          </Link>

          <Link to="/signup" className={`${gradientBtn} hidden md:inline-flex`}>
            Sign up
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="grid place-items-center"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden border-t border-slate-200/60 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95 md:hidden"
          >
            <div className="flex flex-col gap-2 p-5">
              {links.map((l) => {
                const active = activeKey === l.key;
                return (
                  <motion.div key={l.key} variants={itemVariants}>
                    <Link
                      to={l.to}
                      onClick={(e) => handleClick(e, l)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        active
                          ? "bg-sky-500/10 font-semibold text-sky-600 dark:text-sky-300"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{l.label}</span>
                      {active && <span className="h-2 w-2 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                variants={itemVariants}
                className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 dark:border-slate-800"
              >
                <Link to="/login" onClick={() => setOpen(false)} className={`${outlineBtn} h-11`}>
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className={`${gradientBtn} h-11`}>
                  Sign up
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}