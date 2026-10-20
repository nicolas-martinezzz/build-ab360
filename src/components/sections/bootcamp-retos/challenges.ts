/**
 * Challenge keys sent to the backend. The labels live in i18n (the copy may
 * still change before the event); these keys are the stable contract with
 * public/api/bootcamp-challenges.php, which validates them against the same
 * allow-list. Never send labels — only keys.
 *
 * This lives outside BootcampRetosForm.tsx on purpose: that file is a
 * "use client" module, and a plain value exported from a client module becomes
 * a client reference when a Server Component imports it (the prerender fails
 * with `CHALLENGE_KEYS.map is not a function`). Both sides import it from here.
 */
export const CHALLENGE_KEYS = [
  "predictive",
  "deviations",
  "objectives",
  "eu_taxonomy",
  "dashboards",
] as const;

export type ChallengeKey = (typeof CHALLENGE_KEYS)[number];

export type ChallengeCopy = { title: string; problem: string; want: string };
