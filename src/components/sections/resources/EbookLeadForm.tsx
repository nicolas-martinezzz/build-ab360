"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SITE_PATHS } from "@/config/routes";

interface EbookLeadFormProps {
  emailPlaceholder: string;
  consentLabel: string;
  consentLinkLabel: string;
  ctaButton: string;
  submitButton: string;
  successTitle: string;
  downloadButton: string;
  errorMessage: string;
  botBlockedMessage: string;
  privacyNote: string;
  sourceArticle?: string;
}

const EBOOK_PDF_PATH = "/pdfs/ab360-ebook.pdf";
const EBOOK_ENDPOINT = process.env.NEXT_PUBLIC_EBOOK_ENDPOINT ?? "/api/ebook-lead.php";

export const EbookLeadForm = ({
  emailPlaceholder,
  consentLabel,
  consentLinkLabel,
  ctaButton,
  submitButton,
  successTitle,
  downloadButton,
  errorMessage,
  botBlockedMessage,
  privacyNote,
  sourceArticle = "resources",
}: EbookLeadFormProps) => {
  const locale = useLocale();
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setIsLocalDev(
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    );
  }, []);

  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
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
    if (!accepted || !email || isSubmitting) return;

    if (website) {
      setError(botBlockedMessage);
      return;
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < 1500) {
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
        existing.push({ email, accepted, locale, sourceArticle, submittedAt: Date.now() });
        window.localStorage.setItem(storageKey, JSON.stringify(existing));
        setSubmitted(true);
        return;
      }

      const response = await fetch(EBOOK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      <div className="flex flex-col items-start gap-3">
        <p className="text-lg font-semibold text-green-300">{successTitle}</p>
        <a
          className="inline-flex h-11 items-center rounded-[5px] bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-600"
          download
          href={EBOOK_PDF_PATH}
        >
          {downloadButton}
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
    <form className="flex flex-col gap-3" name="ebook-subscription" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="ebook-email">
        {emailPlaceholder}
      </label>
      <input
        className="h-11 rounded-[5px] border border-white/20 bg-transparent px-3.5 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
        id="ebook-email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder={emailPlaceholder}
        required
        type="email"
        value={email}
      />
      {/* honeypot */}
      <input
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px opacity-0"
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        type="text"
        value={website}
      />
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white/70">
        <input
          checked={accepted}
          className="mt-0.5 h-4 w-4 shrink-0 accent-green-500"
          onChange={(e) => setAccepted(e.target.checked)}
          required
          type="checkbox"
        />
        <span>
          {consentLabel}{" "}
          <Link className="underline transition hover:text-white" href={SITE_PATHS.privacy}>
            {consentLinkLabel}
          </Link>
        </span>
      </label>
      <button
        className="h-11 rounded-[5px] bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
        disabled={!accepted || isSubmitting}
        type="submit"
      >
        {isSubmitting ? "..." : submitButton}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <p className="text-xs text-white/40">{privacyNote}</p>
    </form>
  );
};
