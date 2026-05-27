"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { SITE_PATHS } from "@/config/routes";

export function CookieConsentBanner() {
  const t = useTranslations("cookieBanner");
  const { consent, acceptAll, rejectAll, savePreferences } = useCookieConsent();

  // Avoid hydration mismatch: only render after mount
  const [mounted, setMounted] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

  const bannerRef = useRef<HTMLDivElement>(null);
  const rejectButtonRef = useRef<HTMLButtonElement>(null);
  const manageButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    // Move focus to first action on mount so keyboard users are aware of the banner
    rejectButtonRef.current?.focus();
  }, []);

  // Reset analytics toggle to current consent state whenever manage panel opens
  useEffect(() => {
    if (manageOpen) {
      setAnalyticsChecked(consent.analytics);
    }
  }, [manageOpen, consent.analytics]);

  // Focus trap when manage panel is open
  useEffect(() => {
    if (!manageOpen || !bannerRef.current) return;

    const focusable = bannerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setManageOpen(false);
        manageButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [manageOpen]);

  const handleManageClose = useCallback(() => {
    setManageOpen(false);
    manageButtonRef.current?.focus();
  }, []);

  const handleSavePreferences = useCallback(() => {
    savePreferences(analyticsChecked);
    setManageOpen(false);
  }, [savePreferences, analyticsChecked]);

  if (!mounted || consent.decided) return null;

  return (
    <div
      ref={bannerRef}
      aria-label={t("bannerAria")}
      className="fixed bottom-0 left-0 right-0 z-50"
      role="region"
    >
      {/* Manage panel — slides up above the banner */}
      {manageOpen && (
        <div
          aria-labelledby="cookie-manage-title"
          aria-modal="true"
          className={[
            "bg-surface-bg border-t border-white/10 px-4 py-5 sm:px-6",
            "motion-safe:animate-[slideUp_0.2s_ease-out]",
          ].join(" ")}
          role="dialog"
        >
          <h2 className="mb-4 text-sm font-semibold text-white" id="cookie-manage-title">{t("manageTitle")}</h2>

          <div className="space-y-4">
            {/* Necessary — always on, disabled */}
            <label className="flex items-start gap-3">
              <span className="relative mt-0.5 flex-shrink-0">
                <input
                  checked
                  className="sr-only"
                  disabled
                  readOnly
                  type="checkbox"
                />
                <span
                  aria-hidden
                  className="block h-5 w-5 rounded-sm border-2 border-green-500 bg-green-500 opacity-60"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1 top-0.5 block h-3.5 w-2.5 rotate-45 border-b-2 border-r-2 border-white"
                />
              </span>
              <span>
                <span className="block text-sm font-medium text-white">{t("necessary")}</span>
                <span className="block text-xs text-grey-light/70 mt-0.5">{t("necessaryDesc")}</span>
              </span>
            </label>

            {/* Analytics — toggleable */}
            <label className="flex cursor-pointer items-start gap-3">
              <span className="relative mt-0.5 flex-shrink-0">
                <input
                  checked={analyticsChecked}
                  className="peer sr-only"
                  onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  type="checkbox"
                />
                <span
                  aria-hidden
                  className={[
                    "block h-5 w-5 rounded-sm border-2 transition-colors",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-green-300 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-surface-bg",
                    analyticsChecked
                      ? "border-green-500 bg-green-500"
                      : "border-grey-light/40 bg-transparent",
                  ].join(" ")}
                />
                {analyticsChecked && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1 top-0.5 block h-3.5 w-2.5 rotate-45 border-b-2 border-r-2 border-white"
                  />
                )}
              </span>
              <span>
                <span className="block text-sm font-medium text-white">{t("analytics")}</span>
                <span className="block text-xs text-grey-light/70 mt-0.5">{t("analyticsDesc")}</span>
              </span>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              className="rounded-[var(--radius-button)] bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-300"
              onClick={handleSavePreferences}
              type="button"
            >
              {t("savePreferences")}
            </button>
            <button
              aria-label={t("close")}
              className="rounded-[var(--radius-button)] border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-300"
              onClick={handleManageClose}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main banner bar */}
      <div className="bg-surface-bg border-t border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Message + links */}
          <p className="text-sm text-grey-light/80">
            {t("message")}{" "}
            <Link
              className="underline underline-offset-2 transition hover:text-white"
              href={SITE_PATHS.privacy}
            >
              {t("privacyLink")}
            </Link>
            {" · "}
            <Link
              className="underline underline-offset-2 transition hover:text-white"
              href={SITE_PATHS.cookies}
            >
              {t("cookiesLink")}
            </Link>
          </p>

          {/* Action buttons */}
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <button
              className="rounded-[var(--radius-button)] border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-300"
              onClick={rejectAll}
              ref={rejectButtonRef}
              type="button"
            >
              {t("rejectAll")}
            </button>
            <button
              className="rounded-[var(--radius-button)] border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-300"
              onClick={() => setManageOpen((prev) => !prev)}
              ref={manageButtonRef}
              type="button"
            >
              {t("manage")}
            </button>
            <button
              className="rounded-[var(--radius-button)] bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-300"
              onClick={acceptAll}
              type="button"
            >
              {t("acceptAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
