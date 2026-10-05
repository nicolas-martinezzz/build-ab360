/**
 * Canonical path keys (Spanish slugs as source of truth).
 * For locale-specific slugs in nav links, use getLocalizedSlug().
 */

export const SITE_PATHS = {
  home: "/",
  about: "/nosotros",
  challenge: "/challenge",
  autodiagnostico: "/autodiagnostico",
  reservaPlaza: "/reserva-plaza",
  solution: "/solution",
  programa: "/programa",
  privacy: "/privacy",
  cookies: "/cookies",
  contact: "/contact",
  resources: "/resources",
  information: "/information",
} as const;

const LOCALIZED_SLUGS: Record<string, Record<string, string>> = {
  about:       { es: "/nosotros",        en: "/about",           ca: "/nosaltres" },
  programa:    { es: "/programa",        en: "/program",         ca: "/programa" },
  reserva:     { es: "/reserva-plaza",   en: "/book-your-spot",  ca: "/reserva-placa" },
  diagnostic:  { es: "/autodiagnostico", en: "/self-assessment", ca: "/autodiagnostic" },
};

export const getDiagnosticPathByLocale = (locale: string): string =>
  LOCALIZED_SLUGS.diagnostic[locale] ?? LOCALIZED_SLUGS.diagnostic.es;

export const getBootcampPathByLocale = (locale: string): string =>
  LOCALIZED_SLUGS.reserva[locale] ?? LOCALIZED_SLUGS.reserva.es;

export const getAboutPathByLocale = (locale: string): string =>
  LOCALIZED_SLUGS.about[locale] ?? LOCALIZED_SLUGS.about.es;

export const getProgramaPathByLocale = (locale: string): string =>
  LOCALIZED_SLUGS.programa[locale] ?? LOCALIZED_SLUGS.programa.es;

/**
 * Campaña Bootcamp Zero × APCE Catalunya (hasta 22/10/2026): todos los CTA de
 * inscripción apuntan aquí, sin importar el locale del visitante — igual que
 * /reserva-plaza hoy, que tampoco tiene versión en/ca. Revertir manualmente
 * tras la fecha del evento (ver odd/tasks/bootcamp-zero-programa.md).
 */
export const BOOTCAMP_ZERO_CTA_HREF = "/es/programa#bootcamp-formulario";

export const SITE_SECTION_IDS = {
  challenge: "desafio",
  solution: "solution",
  program: "programa",
  about: "nosotros",
  platform: "platform",
  openlabContact: "openlab-contacto",
} as const;

export type SiteNavSectionKey = keyof Pick<
  typeof SITE_SECTION_IDS,
  "challenge" | "solution" | "program" | "about"
>;

export const homeSectionHref = (key: SiteNavSectionKey): string =>
  `${SITE_PATHS.home}#${SITE_SECTION_IDS[key]}`;
