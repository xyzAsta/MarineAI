
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Mail,
} from "lucide-react";

import SoftBackdrop from "../components/SoftBackdrop";

const CONTACT_LOCATION = "Pune, Maharashtra, India";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Pune%2C%20Maharashtra%2C%20India";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: i * 0.05,
      ease: "easeOut",
    },
  }),
};

const inquiryOptions = [
  "General Inquiry",
  "Technical Support",
  "Marine Pollution Report",
  "Research Collaboration",
  "Feedback",
];

const initialForm = {
  name: "",
  email: "",
  subject: "General Inquiry",
  message: "",
};

const inputStyle =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

function validateForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Enter your full name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must contain at least 2 characters.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.subject) {
    errors.subject = "Select an inquiry type.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Enter at least 10 characters.";
  } else if (values.message.length > 3000) {
    errors.message = "Message cannot exceed 3000 characters.";
  }

  return errors;
}

export default function Contact() {
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState("");

  function onChange(event) {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setStatus("idle");
    setNotice("");
  }

  function onSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus("error");
      setNotice("Please correct the highlighted fields.");
      return;
    }

    const subject = `[Marine AI] ${values.subject}`;
    const body = [
      `Name: ${values.name.trim()}`,
      `Reply-to: ${values.email.trim()}`,
      `Inquiry: ${values.subject}`,
      "",
      "Message:",
      values.message.trim(),
    ].join("\n");

    const mailtoUrl =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    setStatus("email");
    setNotice(
      "Your email application should open. Send the prepared email to complete delivery."
    );

    window.location.href = mailtoUrl;
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-clip text-slate-900 dark:text-white">
      <SoftBackdrop />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-7 lg:px-8">
        {/* Page heading */}
        <motion.header
          initial="hidden"
          animate="visible"
          className="mb-6 flex flex-col gap-2 sm:mb-7"
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-400">
              <MessageSquare size={16} aria-hidden="true" />
              Contact
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Get in touch
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base"
          >
            Contact Marine AI for technical support, pollution reports,
            research enquiries or collaboration.
          </motion.p>
        </motion.header>

        {/* Main contact layout */}
        <section className="grid items-stretch gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:gap-5">
          {/* Information panel */}
          <motion.aside
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:p-7"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/20"
            />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-white/10 dark:text-cyan-300">
                <Mail size={22} aria-hidden="true" />
              </div>

              <h2 className="mt-5 text-xl font-semibold sm:text-2xl">
                Contact our team
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Send your enquiry and include the details needed to understand
                your question.
              </p>

              <div className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-300"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold">
                      Technical support
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                      Questions about platform functionality.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-300"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold">
                      Research collaboration
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                      Environmental research and project enquiries.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-300"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold">
                      Location
                    </h3>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600 transition hover:text-sky-700 dark:text-slate-400 dark:hover:text-white"
                    >
                      {CONTACT_LOCATION}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-7 border-t border-slate-200 pt-4 dark:border-white/10 lg:mt-auto lg:pt-6">
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                Business hours: Monday to Friday, 9:00 AM–5:00 PM IST.
              </p>
            </div>
          </motion.aside>

          {/* Contact form */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Send us a message
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Fields marked <span className="text-rose-500">*</span> are
                required.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {notice && (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role={status === "error" ? "alert" : "status"}
                  className={`mb-4 rounded-lg border p-3 text-sm leading-5 ${
                    status === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                      : "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                  }`}
                >
                  {notice}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Full name <span className="text-rose-500">*</span>
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={onChange}
                    placeholder="Your name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "contact-name-error" : undefined
                    }
                    className={`${inputStyle} ${
                      errors.name ? "border-rose-400" : ""
                    }`}
                  />

                  {errors.name && (
                    <p
                      id="contact-name-error"
                      className="mt-1 text-xs text-rose-500"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Email address <span className="text-rose-500">*</span>
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "contact-email-error" : undefined
                    }
                    className={`${inputStyle} ${
                      errors.email ? "border-rose-400" : ""
                    }`}
                  />

                  {errors.email && (
                    <p
                      id="contact-email-error"
                      className="mt-1 text-xs text-rose-500"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Inquiry type <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <select
                    id="contact-subject"
                    name="subject"
                    value={values.subject}
                    onChange={onChange}
                    className={`${inputStyle} appearance-none pr-10`}
                    aria-invalid={Boolean(errors.subject)}
                  >
                    {inquiryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>

                {errors.subject && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="contact-message"
                    className="text-sm font-medium"
                  >
                    Message <span className="text-rose-500">*</span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {values.message.length}/3000
                  </span>
                </div>

                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  maxLength={3000}
                  value={values.message}
                  onChange={onChange}
                  placeholder="How can we help?"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message ? "contact-message-error" : undefined
                  }
                  className={`${inputStyle} min-h-24 resize-y leading-6 ${
                    errors.message ? "border-rose-400" : ""
                  }`}
                />

                {errors.message && (
                  <p
                    id="contact-message-error"
                    className="mt-1 text-xs text-rose-500"
                  >
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:scale-[0.99] dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                <Send size={16} aria-hidden="true" />
                Prepare email
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>

              <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                Your email application opens with the message prepared.
                You must send it to complete delivery.
              </p>
            </form>
          </motion.section>
        </section>
      </main>
    </div>
  );
}
