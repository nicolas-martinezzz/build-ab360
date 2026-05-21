"use client";

import { useTranslations } from "next-intl";

export function DiagnosticHeroSection() {
  const t = useTranslations("diagnosticPage.hero");

  return (
    <section
      aria-labelledby="diagnostic-hero-heading"
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, var(--color-surface-bg) 0%, var(--color-surface-bg) 62%, var(--color-green-600) 100%)" }}
    >
      {/* Decorative radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[36rem] w-[36rem] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, var(--color-green-500) 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-14 sm:pb-18 md:pb-20">
        <p className="text-xs font-bold tracking-[0.18em] uppercase text-green-500 mb-5">
          {t("eyebrow")}
        </p>
        <h1
          id="diagnostic-hero-heading"
          className="text-white font-normal leading-[1.1] tracking-[-0.025em] mb-6 max-w-[760px]"
          style={{ fontSize: "clamp(28px, 4.5vw, 48px)" }}
        >
          {t("heading")}
        </h1>
        <p
          className="text-white/70 leading-[1.65] max-w-[560px]"
          style={{ fontSize: "clamp(15px, 1.6vw, 17px)" }}
        >
          {t.rich("body", {
            highlight: (chunks) => (
              <em className="not-italic text-green-500 font-medium">{chunks}</em>
            ),
          })}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-white/50">
          <span className="flex items-center gap-2">
            <svg aria-hidden className="w-4 h-4 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            {t("badge10min")}
          </span>
          <span className="flex items-center gap-2">
            <svg aria-hidden className="w-4 h-4 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("badgeResult")}
          </span>
          <span className="flex items-center gap-2">
            <svg aria-hidden className="w-4 h-4 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 12h6m-3-3v6M12 3a9 9 0 110 18A9 9 0 0112 3z" strokeLinecap="round" />
            </svg>
            {t("badgeQuestions")}
          </span>
        </div>
      </div>
    </section>
  );
}
