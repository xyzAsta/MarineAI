import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import WaveBackground from "../components/WaveBackground";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const fade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const inputCls =
  "w-full rounded-xl border bg-white/50 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:bg-slate-900/50 dark:text-white";
const labelCls =
  "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // After success, go to login automatically
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate("/login", { replace: true }), 2500);
    return () => clearTimeout(t);
  }, [done, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (password.length < 8) found.password = "Use at least 8 characters";
    if (confirm !== password) found.confirm = "Passwords do not match";
    setErrors(found);
    if (Object.keys(found).length) return;

    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.detail === "string" ? data.detail : "Please check your password and try again.");
      }
      setDone(true);
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

  const border = (k) => (errors[k] ? "border-rose-400" : "border-slate-300 dark:border-slate-700");

  return (
    <WaveBackground className="min-h-screen pt-24 pb-32">
      <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-7xl items-center justify-center px-4 sm:px-6">
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          className="relative z-20 w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/85 p-8 shadow-2xl shadow-sky-500/20 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/85"
        >
          {/* Missing token */}
          {!token && (
            <div className="space-y-3 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Invalid reset link</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                This link is missing its token. Please request a new one.
              </p>
              <Link to="/forgot-password" className="inline-block rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-6 py-2.5 text-xs font-semibold text-white">
                Request new link
              </Link>
            </div>
          )}

          {/* Success */}
          {token && done && (
            <div className="space-y-3 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Password updated</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Redirecting you to log in...</p>
              <Link to="/login" className="text-xs font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400">
                Go to log in now
              </Link>
            </div>
          )}

          {/* Form */}
          {token && !done && (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Choose a new password</h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Use at least 8 characters.
                </p>
              </div>

              {error && (
                <div role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {error}{" "}
                  {error.includes("expired") && (
                    <Link to="/forgot-password" className="underline">Request a new link</Link>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                <div>
                  <label htmlFor="password" className={labelCls}>New password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock size={18} /></span>
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      className={`${inputCls} ${border("password")} pr-10`}
                    />
                    <button type="button" onClick={() => setShow(!show)} aria-label="Show or hide password"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirm" className={labelCls}>Confirm password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock size={18} /></span>
                    <input
                      id="confirm"
                      type={show ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className={`${inputCls} ${border("confirm")} pr-4`}
                    />
                  </div>
                  {errors.confirm && <p className="mt-1 text-xs text-rose-500">{errors.confirm}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: busy ? 1 : 1.01 }}
                  whileTap={{ scale: busy ? 1 : 0.98 }}
                  type="submit"
                  disabled={busy}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 py-3 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busy ? (
                    <><Loader2 size={16} className="animate-spin" /> Updating...</>
                  ) : (
                    <>Update password <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </WaveBackground>
  );
}