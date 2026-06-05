"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { LeadData } from "@/lib/diagnostic/types";

type Props = {
  locale: string;
  mode?: "diagnostic" | "bootcamp";
  onDone: (lead: LeadData) => Promise<void>;
};

export function StepPrelead({ locale, mode = "diagnostic", onDone }: Props) {
  const t = useTranslations("diagnosticPage.prelead");
  const searchParams = useSearchParams();
  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [company, setCompany] = useState(searchParams.get("company") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !company.trim() || !email.trim()) {
      setError(t("errorRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("errorEmail"));
      return;
    }
    if (!privacy) {
      setError(t("errorPrivacy"));
      return;
    }

    setLoading(true);
    try {
      await onDone({ name: name.trim(), company: company.trim(), email: email.trim() });
    } catch {
      setError(t("errorServer"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-[10px] border border-grey-light shadow-[var(--shadow-step)] overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">

          {/* Left panel — changes per mode */}
          <div className="p-8 lg:p-10 border-b md:border-b-0 md:border-r border-grey-light">
            {mode === "bootcamp" ? <BootcampLeft t={t} /> : <DiagnosticLeft t={t} />}
          </div>

          {/* Right — form (shared) */}
          <div className="p-8 lg:p-10">
            <p className="text-xs font-bold tracking-[0.14em] uppercase text-grey-dark mb-2">
              {t("eyebrow")}
            </p>
            <h3 className="text-xl font-semibold text-surface-bg mb-5">
              {t("heading")}
            </h3>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Field label={t("fieldName")} htmlFor="dl-name">
                <input
                  id="dl-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("fieldNamePlaceholder")}
                  className={inputCls}
                  autoComplete="given-name"
                />
              </Field>
              <Field label={t("fieldCompany")} htmlFor="dl-company">
                <input
                  id="dl-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t("fieldCompanyPlaceholder")}
                  className={inputCls}
                  autoComplete="organization"
                />
              </Field>
              <Field label={t("fieldEmail")} htmlFor="dl-email">
                <input
                  id="dl-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("fieldEmailPlaceholder")}
                  className={inputCls}
                  autoComplete="email"
                />
              </Field>

              <div className="rounded-lg bg-green-100 border border-green-200 px-4 py-3">
                <p className="text-sm text-green-600 leading-[1.5]">
                  {mode === "bootcamp" ? t("infoBoxBootcamp") : t("infoBoxDiagnostic")}
                </p>
              </div>

              <label className="flex gap-3 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  className="mt-1 accent-green-500 flex-shrink-0"
                />
                <span className="text-sm text-grey-dark leading-[1.5]">
                  {t("privacyText")}{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 underline underline-offset-2"
                  >
                    {t("privacyLinkText")}
                  </Link>{" "}
                  {t("privacySuffix")}
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white font-semibold text-[15px] px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? t("submitting")
                  : mode === "bootcamp"
                  ? <>{t("submitBootcamp")} <span aria-hidden>→</span></>
                  : <>{t("submitDiagnostic")} <span aria-hidden>→</span></>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Left panel variants ─── */

type TranslationFn = ReturnType<typeof useTranslations<"diagnosticPage.prelead">>;

function DiagnosticLeft({ t }: { t: TranslationFn }) {
  return (
    <>
      <p className="text-xs font-bold tracking-[0.14em] uppercase text-green-600 mb-4">
        {t("diagnosticLeftEyebrow")}
      </p>
      <h2 className="text-[26px] sm:text-[30px] font-semibold text-surface-bg leading-[1.2] tracking-[-0.02em] mb-4">
        {t("diagnosticLeftHeading")}
      </h2>
      <p className="text-[15px] text-grey-dark leading-[1.65] mb-6">
        {t.rich("diagnosticLeftBody", {
          strong: (chunks) => (
            <strong className="text-surface-bg font-semibold">{chunks}</strong>
          ),
        })}
      </p>
      <div className="flex flex-wrap gap-3 text-sm text-grey-dark">
        <span className="flex items-center gap-1.5">
          <svg aria-hidden className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
          {t("badge7min")}
        </span>
        <span className="flex items-center gap-1.5">
          <svg aria-hidden className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("badgeResult")}
        </span>
      </div>
    </>
  );
}

function BootcampLeft({ t }: { t: TranslationFn }) {
  const steps = [
    { n: "01", title: t("bootcampStep1Title"), body: t("bootcampStep1Body") },
    { n: "02", title: t("bootcampStep2Title"), body: t("bootcampStep2Body") },
    { n: "03", title: t("bootcampStep3Title"), body: t("bootcampStep3Body") },
  ];

  return (
    <>
      <p className="text-xs font-bold tracking-[0.14em] uppercase text-green-600 mb-4">
        {t("bootcampLeftEyebrow")}
      </p>
      <h2 className="text-[28px] sm:text-[32px] font-semibold text-surface-bg leading-[1.2] tracking-[-0.02em] mb-2">
        {t("bootcampLeftHeading")}
      </h2>
      <p className="text-base font-semibold text-grey-dark mb-5">
        {t("bootcampLeftSubheading")}
      </p>
      <p className="text-[15px] text-grey-dark leading-[1.65] mb-8">
        {t("bootcampLeftBody")}
      </p>
      <ol className="space-y-3">
        {steps.map(({ n, title, body }) => (
          <li key={n} className="flex gap-4 rounded-lg border border-grey-light px-5 py-4">
            <span className="text-[1.125rem] font-bold text-green-600 leading-[1.4] shrink-0 w-7">{n}.</span>
            <div>
              <p className="text-sm font-bold text-surface-bg">{title}</p>
              <p className="text-sm text-grey-dark leading-[1.55] mt-0.5">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

/* ─── Shared helpers ─── */

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-surface-bg mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-grey-light rounded-lg px-3 py-2.5 text-sm text-surface-bg placeholder:text-grey-dark focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 transition-colors";
