"use client";

import { useCallback, useEffect, useState } from "react";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  decided: boolean;
};

const STORAGE_KEY = "cookie-consent";

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  decided: false,
};

function parseStoredConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.analytics !== "boolean") return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      decided: true,
    };
  } catch {
    return null;
  }
}

/** Non-hook utility for reading consent outside React (e.g. GA integration). */
export function getCookieConsent(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  const stored = parseStoredConsent(localStorage.getItem(STORAGE_KEY));
  return stored ?? DEFAULT_CONSENT;
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = parseStoredConsent(localStorage.getItem(STORAGE_KEY));
    if (stored) setConsent(stored);
  }, []);

  const persist = useCallback((next: ConsentState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: next.analytics }));
    setConsent(next);
  }, []);

  const acceptAll = useCallback(() => {
    persist({ necessary: true, analytics: true, decided: true });
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist({ necessary: true, analytics: false, decided: true });
  }, [persist]);

  const savePreferences = useCallback(
    (analytics: boolean) => {
      persist({ necessary: true, analytics, decided: true });
    },
    [persist],
  );

  return { consent, acceptAll, rejectAll, savePreferences };
}
