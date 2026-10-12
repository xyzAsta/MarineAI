import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import WaveBackground from "../components/WaveBackground";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const fade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      setSubmitted(true);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Please make sure the backend is running."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <WaveBackground className="min-h-screen pt-24 pb-32">
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl items-center justify-center px-4 sm:px-6">
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          className="relative z-20 w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/85 p-8 shadow-2xl shadow-sky-500/20 backdrop-blur-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/85"
        >
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset password</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {submitted
                ? "Check your inbox for the next step."
                : "Enter your registered email and we'll send you a reset link."}
            </p>
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-300 bg-white/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: busy ? 1 : 1.01 }}
                whileTap={{ scale: busy ? 1 : 0.98 }}
                type="submit"
                disabled={busy}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 py-3 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <>Send reset link <ArrowRight size={16} /></>
                )}
              </motion.button>
            </form>
          ) : (
            <div className="mt-6 space-y-3 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                If an account exists for{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{email}</span>, you will receive a
                reset link shortly. The link expires in 30 minutes.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400"
              >
                Use a different email
              </button>
            </div>
          )}

          <div className="mt-6 border-t border-slate-200/60 pt-5 text-center dark:border-slate-800">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 transition-colors hover:text-sky-500 dark:text-sky-400">
              <ArrowLeft size={16} />
              Back to log in
            </Link>
          </div>
        </motion.div>
      </div>
    </WaveBackground>
  );
}