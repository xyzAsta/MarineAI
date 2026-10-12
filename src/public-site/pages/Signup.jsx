import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Building2, Microscope, Users } from "lucide-react";
import WaveBackground from "../components/WaveBackground";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_ENABLED === "true";

const fade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const roles = [
  { value: "general_user", label: "General User", hint: "Report and view", icon: Users },
  { value: "researcher", label: "Researcher", hint: "Analyze data", icon: Microscope },
  { value: "ngo", label: "NGO / Org", hint: "Run cleanups", icon: Building2 },
];

const inputCls =
  "w-full rounded-xl border bg-white/50 dark:bg-slate-900/50 py-2.5 pl-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all";

const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400";

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "Enter your full name";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address";
  if (v.password.length < 8) e.password = "Use at least 8 characters";
  if (v.confirm !== v.password) e.confirm = "Passwords do not match";
  return e;
}

export default function Signup() {
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [role, setRole] = useState("general_user");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email,
          password: values.password,
          role,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string" ? data.detail : "Please check your details and try again."
        );
      }

      localStorage.setItem("marineai_token", data.token);
      localStorage.setItem("marineai_user", JSON.stringify(data.user));
      navigate("/dashboard");
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

  const handleGoogle = () => {
    if (!GOOGLE_ENABLED) {
      setError("Google sign-up will work once it is connected to the backend.");
      return;
    }
    window.location.href = `${API}/auth/google/login`;
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
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create an account</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Join our network to monitor and protect coastlines
            </p>
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <GoogleIcon />
            Sign up with Google
          </motion.button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
            or sign up with email
            <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Role */}
            <div>
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                I am joining as
              </span>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(({ value, label, hint, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`rounded-xl border p-2.5 text-center transition ${
                      role === value
                        ? "border-sky-500 bg-sky-500/10 text-sky-700 shadow-md shadow-sky-500/10 dark:text-sky-300"
                        : "border-slate-200 text-slate-600 hover:border-sky-300 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Icon size={18} className="mx-auto" />
                    <p className="mt-1 text-[11px] font-semibold">{label}</p>
                    <p className="text-[10px] opacity-70">{hint}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className={labelCls}>Full name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User size={18} /></span>
                <input id="name" name="name" value={values.name} onChange={onChange} placeholder="Your name"
                  autoComplete="name" className={`${inputCls} ${border("name")} pr-4`} />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelCls}>Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail size={18} /></span>
                <input id="email" name="email" type="email" value={values.email} onChange={onChange}
                  placeholder="name@example.com" autoComplete="email" className={`${inputCls} ${border("email")} pr-4`} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>

            {/* Passwords */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className={labelCls}>Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock size={18} /></span>
                  <input id="password" name="password" type={showPassword ? "text" : "password"}
                    value={values.password} onChange={onChange} placeholder="Min 8 characters"
                    autoComplete="new-password" className={`${inputCls} ${border("password")} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirm" className={labelCls}>Confirm</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock size={18} /></span>
                  <input id="confirm" name="confirm" type={showPassword ? "text" : "password"}
                    value={values.confirm} onChange={onChange} placeholder="Repeat password"
                    autoComplete="new-password" className={`${inputCls} ${border("confirm")} pr-4`} />
                </div>
                {errors.confirm && <p className="mt-1 text-xs text-rose-500">{errors.confirm}</p>}
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
                <><Loader2 size={16} className="animate-spin" /> Creating account...</>
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6 border-t border-slate-200/60 pt-5 text-center dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="inline-block font-semibold text-sky-600 transition-colors hover:text-sky-500 dark:text-sky-400">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </WaveBackground>
  );
}