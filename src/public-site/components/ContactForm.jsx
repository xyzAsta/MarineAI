import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

const empty = { name: "", email: "", message: "" };

const field =
  "w-full rounded-xl border bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 dark:bg-slate-900/70 dark:text-white";

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Please enter your name";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address";
  if (v.message.trim().length < 10) e.message = "Message should be at least 10 characters";
  return e;
}

export default function ContactForm({ rows = 4 }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    // TODO: replace with the real API call when the backend is ready:
    // await fetch("http://localhost:8000/contact", { method: "POST", ... })
    await new Promise((r) => setTimeout(r, 900));
    setStatus("sent");
    setValues(empty);
  };

  if (status === "sent") {
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/80 p-8 text-center backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
        <CheckCircle2 className="text-teal-500" size={48} />
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Message sent</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Thanks for reaching out. We will get back to you soon.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-sky-500/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Name</label>
          <input id="name" name="name" value={values.name} onChange={onChange} placeholder="Your name"
            className={`${field} ${errors.name ? "border-rose-400" : "border-slate-300 dark:border-slate-700"}`} />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input id="email" name="email" type="email" value={values.email} onChange={onChange} placeholder="you@example.com"
            className={`${field} ${errors.email ? "border-rose-400" : "border-slate-300 dark:border-slate-700"}`} />
          {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Message</label>
        <textarea id="message" name="message" rows={rows} value={values.message} onChange={onChange}
          placeholder="How can we help?"
          className={`${field} resize-none ${errors.message ? "border-rose-400" : "border-slate-300 dark:border-slate-700"}`} />
        {errors.message && <p className="mt-1 text-xs text-rose-500">{errors.message}</p>}
      </div>

      <button type="submit" disabled={status === "sending"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-sky-500/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0">
        {status === "sending" ? (
          <><Loader2 size={18} className="animate-spin" /> Sending...</>
        ) : (
          <>Send message <Send size={16} className="transition group-hover:translate-x-1" /></>
        )}
      </button>
    </form>
  );
}