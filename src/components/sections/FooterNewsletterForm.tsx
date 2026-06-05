"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

interface FooterNewsletterFormProps {
  namePlaceholder: string;
  emailPlaceholder: string;
  privacyCheck: string;
  privacyPolicyLabel: string;
  subscribeButton: string;
  successMessage: string;
  errorMessage: string;
  botBlockedMessage: string;
}

export const FooterNewsletterForm = ({
  namePlaceholder,
  emailPlaceholder,
  privacyCheck,
  privacyPolicyLabel,
  subscribeButton,
  successMessage,
  errorMessage,
  botBlockedMessage,
}: FooterNewsletterFormProps) => {
  const locale = useLocale();
  const isLocalDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const newsletterEndpoint = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT ?? "/api/newsletter.php";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState<number>(() => Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted || !email || isSubmitting) return;

    if (website) {
      setError(botBlockedMessage);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isLocalDev) {
        const storageKey = "ab360_local_newsletter_subscribers";
        const existingRaw = window.localStorage.getItem(storageKey);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push({
          name,
          email,
          accepted,
          locale,
          submittedAt: Date.now(),
        });
        window.localStorage.setItem(storageKey, JSON.stringify(existing));
        setSubmitted(true);
        return;
      }

      const response = await fetch(newsletterEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          accepted,
          locale,
          website,
          submittedAt: startedAt,
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
    return <p className="text-sm text-green-300">{successMessage}</p>;
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1.5">
        <span className="sr-only">{namePlaceholder}</span>
        <input
          className="h-11 rounded-[5px] border border-white/20 bg-transparent px-3.5 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg"
          onChange={(e) => setName(e.target.value)}
          placeholder={namePlaceholder}
          type="text"
          value={name}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="sr-only">{emailPlaceholder}</span>
        <input
          className="h-11 rounded-[5px] border border-white/20 bg-transparent px-3.5 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg"
          onChange={(e) => setEmail(e.target.value)}
          placeholder={emailPlaceholder}
          required
          type="email"
          value={email}
        />
      </label>
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
          {privacyCheck}{" "}
          <Link className="underline transition hover:text-white" href="/privacy">
            {privacyPolicyLabel}
          </Link>
        </span>
      </label>
      <button
        className="h-11 rounded-[5px] bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-400 disabled:opacity-50"
        disabled={!accepted || isSubmitting}
        type="submit"
      >
        {subscribeButton}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </form>
  );
};
