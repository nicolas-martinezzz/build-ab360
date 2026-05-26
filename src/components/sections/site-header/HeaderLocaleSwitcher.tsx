"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type Props = {
  localeEs: string;
  localeEn: string;
  localeCa: string;
  ariaLabel: string;
  variant?: "dropdown" | "inline";
};

const LOCALES = ["es", "en", "ca"] as const;

const GlobeIcon = () => (
  <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round" />
  </svg>
);

export function HeaderLocaleSwitcher({ localeEs, localeEn, localeCa, ariaLabel, variant = "dropdown" }: Props) {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const labels: Record<string, string> = { es: localeEs, en: localeEn, ca: localeCa };

  useEffect(() => {
    if (!open || variant === "inline") return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, variant]);

  if (variant === "inline") {
    return (
      <nav aria-label={ariaLabel} className="flex items-center gap-1">
        <GlobeIcon />
        <div className="ml-2 flex items-center gap-3 text-sm">
          {LOCALES.map((locale, i) => (
            <span key={locale} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden className="text-white/25">|</span>}
              <Link
                aria-current={currentLocale === locale ? "page" : undefined}
                className={currentLocale === locale ? "font-medium text-white" : "text-white/65 transition hover:text-white"}
                href={pathname}
                locale={locale}
              >
                {labels[locale]}
              </Link>
            </span>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="inline-flex size-10 items-center justify-center rounded-[var(--radius-button)] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
      </button>

      {open && (
        <ul
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-[80] mt-1.5 min-w-[7rem] overflow-hidden rounded-lg border border-white/10 bg-surface-bg py-1 shadow-[var(--shadow-header-compact)]"
          role="listbox"
        >
          {LOCALES.map((locale) => (
            <li key={locale} aria-selected={currentLocale === locale} role="option">
              <Link
                className={[
                  "flex w-full items-center gap-2.5 px-4 py-2 text-sm transition",
                  currentLocale === locale
                    ? "font-medium text-white"
                    : "text-white/65 hover:bg-white/[0.08] hover:text-white",
                ].join(" ")}
                href={pathname}
                locale={locale}
                onClick={() => setOpen(false)}
              >
                <span aria-hidden className={["h-1.5 w-1.5 shrink-0 rounded-full", currentLocale === locale ? "bg-green-400" : ""].join(" ")} />
                {labels[locale]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
