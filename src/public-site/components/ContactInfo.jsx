import {
  ArrowUpRight,
  Clock3,
  Mail,
  ShieldCheck,
} from "lucide-react";

const CONTACT_EMAIL = "support@marineai.example";
const CONTACT_LOCATION = "Pune, Maharashtra, India";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Pune%2C%20Maharashtra%2C%20India";

function GmailIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 39V12.5C6 9.46 9.49 7.74 11.9 9.6L24 19"
        stroke="#EA4335"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M42 39V12.5C42 9.46 38.51 7.74 36.1 9.6L24 19"
        stroke="#4285F4"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M6 14V39"
        stroke="#34A853"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M42 14V39"
        stroke="#FBBC04"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M11.9 9.6L24 19L36.1 9.6"
        stroke="#EA4335"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleMapsIcon({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M24 44C20 37 9 26 9 18C9 9.72 15.72 3 24 3"
        stroke="#34A853"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M24 3C32.28 3 39 9.72 39 18C39 26 28 37 24 44"
        stroke="#4285F4"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M24 3C17.7 3 12.5 6.9 10.2 12.2"
        stroke="#EA4335"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M10.2 12.2C9.4 14 9 16 9 18"
        stroke="#FBBC04"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="24" cy="18" r="6" fill="white" />
      <circle cx="24" cy="18" r="3" fill="#4285F4" />
    </svg>
  );
}

function ContactLink({ href, icon: Icon, label, children }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-sky-800"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="mt-1 block break-words text-sm font-semibold text-slate-900 dark:text-white">
          {children}
        </span>
      </span>
      <ArrowUpRight
        size={16}
        className="shrink-0 text-slate-400 transition group-hover:text-sky-600 dark:group-hover:text-sky-300"
        aria-hidden="true"
      />
    </a>
  );
}

export default function ContactInfo() {
  return (
    <aside className="relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950 sm:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl"
      />


      <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
        Contact our team
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        We welcome questions, feedback, pollution reports, and research
        collaboration enquiries.
      </p>

      <div className="mt-6 space-y-3">
        <ContactLink
          href={`mailto:${CONTACT_EMAIL}`}
          icon={GmailIcon}
          label="Email us"
        >
          {CONTACT_EMAIL}
        </ContactLink>
        <ContactLink
          href={MAPS_URL}
          icon={GoogleMapsIcon}
          label="Our location"
        >
          {CONTACT_LOCATION}
        </ContactLink>
      </div>

      <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Clock3
            size={18}
            className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400"
            aria-hidden="true"
          />
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Business hours
            </h4>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              Monday–Friday
              <br />
              9:00 AM–5:00 PM IST
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400"
            aria-hidden="true"
          />
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Helpful details
            </h4>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              Include relevant dates or locations so we can better understand
              your enquiry.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
