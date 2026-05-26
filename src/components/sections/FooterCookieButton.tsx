"use client";

import { useCookieConsent } from "@/hooks/useCookieConsent";

type Props = { label: string };

export function FooterCookieButton({ label }: Props) {
  const { savePreferences } = useCookieConsent();

  const handleClick = () => {
    // Reset decided so the banner reappears
    savePreferences(false);
    // Force a re-read by reloading — simplest approach without global state
    window.location.reload();
  };

  return (
    <button
      className="underline-offset-2 transition hover:text-white hover:underline text-white/50 text-sm"
      onClick={handleClick}
      type="button"
    >
      {label}
    </button>
  );
}
