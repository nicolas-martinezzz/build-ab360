/**
 * Central paths and in-page section ids for the marketing site.
 * Use these from nav links and section roots so anchors stay in sync when adding pages.
 */

export const SITE_PATHS = {
  home: "/",
  about: "/nosotros",
  challenge: "/challenge",
  solution: "/solution",
  programa: "/programa",
  privacy: "/privacy",
  cookies: "/cookies",
  contact: "/contact",
  resources: "/resources",
  information: "/information",
} as const;

export const SITE_SECTION_IDS = {
  challenge: "desafio",
  solution: "solution",
  program: "programa",
  about: "nosotros",
  platform: "platform",
} as const;

export type SiteNavSectionKey = keyof Pick<
  typeof SITE_SECTION_IDS,
  "challenge" | "solution" | "program" | "about"
>;

export const homeSectionHref = (key: SiteNavSectionKey): string =>
  `${SITE_PATHS.home}#${SITE_SECTION_IDS[key]}`;
