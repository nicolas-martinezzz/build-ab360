"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SITE_PATHS } from "@/config/routes";

interface EbookLeadFormProps {
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  companyPlaceholder: string;
  emailPlaceholder: string;
  consentLabel: string;
  consentLinkLabel: string;
  ctaButton: string;
  submitButton: string;
  successTitle: string;
  downloadButton: string;
  errorMessage: string;
  botBlockedMessage: string;
  requiredNote: string;
  sourceArticle?: string;
  initiallyExpanded?: boolean;
}

const EBOOK_PDF_PATH = "/pdfs/ab360-ebook.pdf";
const EBOOK_ENDPOINT = process.env.NEXT_PUBLIC_EBOOK_ENDPOINT ?? "/api/ebook-lead.php";

export const EbookLeadForm = ({
  firstNamePlaceholder,
  lastNamePlaceholder,
  companyPlaceholder,
  emailPlaceholder,
  consentLabel,
  consentLinkLabel,
  ctaButton,
  submitButton,
  successTitle,
  downloadButton,
  errorMessage,
  botBlockedMessage,
  requiredNote,
  sourceArticle = "resources",
  initiallyExpanded = false,
}: EbookLeadFormProps) => {
  const locale = useLocale();
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [showForm, setShowForm] = useState(initiallyExpanded);

  useEffect(() => {
    setIsLocalDev(
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    );
  }, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);

  const handleShowForm = () => {
    setShowForm(true);
    setStartedAt(Date.now());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted || !email || !firstName || !lastName || !company || isSubmitting) return;

    if (website) {
      setError(botBlockedMessage);
      return;
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < 800) {
      setError(botBlockedMessage);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isLocalDev) {
        const storageKey = "ab360_local_ebook_leads";
        const existingRaw = window.localStorage.getItem(storageKey);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push({
          firstName,
          lastName,
          company,
          email,
          accepted,
          locale,
          sourceArticle,
          submittedAt: Date.now(),
        });
        window.localStorage.setItem(storageKey, JSON.stringify(existing));
        setSubmitted(true);
        return;
      }

      const response = await fetch(EBOOK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          company,
          email,
          accepted,
          locale,
          source_article: sourceArticle,
          website,
          submitted_at: startedAt,
        }),
      });

      if (!response.ok) {
        setError(errorMessage);
        return;
      }

      setSubmitted(true);
    } catch {
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
            <svg aria-hidden className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-base font-semibold text-white">{successTitle}</p>
        </div>
        <a
          className="inline-flex h-11 items-center gap-2 rounded-[5px] bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-600"
          download
          href={EBOOK_PDF_PATH}
        >
          {downloadButton}
          <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        className="h-11 rounded-[5px] bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-600"
        onClick={handleShowForm}
        type="button"
      >
        {ctaButton}
      </button>
    );
  }

  return (
    <form className="flex flex-col gap-5" name="ebook-subscription" onSubmit={handleSubmit}>
      {/* Required note */}
      <p className="text-xs text-white/40">
        <span aria-hidden className="mr-1 text-green-400">*</span>
        {requiredNote}
      </p>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Field htmlFor="ebook-first-name" label={firstNamePlaceholder}>
          <input
            className={inputClass}
            id="ebook-first-name"
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={firstNamePlaceholder}
            required
            type="text"
            value={firstName}
          />
        </Field>
        <Field htmlFor="ebook-last-name" label={lastNamePlaceholder}>
          <input
            className={inputClass}
            id="ebook-last-name"
            onChange={(e) => setLastName(e.target.value)}
            placeholder={lastNamePlaceholder}
            required
            type="text"
            value={lastName}
          />
        </Field>
      </div>

      <Field htmlFor="ebook-company" label={companyPlaceholder}>
        <input
          className={inputClass}
          id="ebook-company"
          onChange={(e) => setCompany(e.target.value)}
          placeholder={companyPlaceholder}
          required
          type="text"
          value={company}
        />
      </Field>

      <Field htmlFor="ebook-email" label={emailPlaceholder}>
        <input
          className={inputClass}
          id="ebook-email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder={emailPlaceholder}
          required
          type="email"
          value={email}
        />
      </Field>

      {/* honeypot */}
      <input
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px opacity-0"
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        type="text"
        value={website}
      />

      <label className="flex cursor-pointer items-start gap-3 text-sm text-white/60 transition hover:text-white/80">
        <input
          checked={accepted}
          className="mt-0.5 h-4 w-4 shrink-0 accent-green-500"
          onChange={(e) => setAccepted(e.target.checked)}
          required
          type="checkbox"
        />
        <span>
          {consentLabel}{" "}
          <Link className="text-green-400 underline underline-offset-2 transition hover:text-green-300" href={SITE_PATHS.privacy}>
            {consentLinkLabel}
          </Link>
        </span>
      </label>

      <button
        className="mt-1 flex h-12 items-center justify-center gap-2 rounded-[5px] bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!accepted || isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg aria-hidden className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" fill="currentColor" />
            </svg>
          </span>
        ) : submitButton}
      </button>

      {error ? (
        <p className="flex items-center gap-2 rounded-[5px] bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          <svg aria-hidden className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          {error}
        </p>
      ) : null}
    </form>
  );
};

const inputClass =
  "h-11 w-full rounded-[5px] border border-white/15 bg-white/5 px-3.5 text-sm text-white placeholder:text-white/30 transition focus:border-green-500/60 focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-green-500/20";

function Field({ htmlFor, label, children }: { htmlFor: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-xs font-medium text-white/60" htmlFor={htmlFor}>
        {label}
        <span aria-hidden className="text-green-400">*</span>
      </label>
      {children}
    </div>
  );
}
