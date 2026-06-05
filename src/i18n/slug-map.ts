type LocaleSlugMap = Record<string, Record<string, string>>;

const SLUG_EQUIVALENCES: LocaleSlugMap = {
  nosotros:         { es: "/nosotros",        en: "/about",           ca: "/nosaltres" },
  about:            { es: "/nosotros",        en: "/about",           ca: "/nosaltres" },
  nosaltres:        { es: "/nosotros",        en: "/about",           ca: "/nosaltres" },
  programa:         { es: "/programa",        en: "/program",         ca: "/programa" },
  program:          { es: "/programa",        en: "/program",         ca: "/programa" },
  "reserva-plaza":  { es: "/reserva-plaza",   en: "/book-your-spot",  ca: "/reserva-placa" },
  "book-your-spot": { es: "/reserva-plaza",   en: "/book-your-spot",  ca: "/reserva-placa" },
  "reserva-placa":  { es: "/reserva-plaza",   en: "/book-your-spot",  ca: "/reserva-placa" },
  autodiagnostico:  { es: "/autodiagnostico", en: "/self-assessment", ca: "/autodiagnostic" },
  "self-assessment":{ es: "/autodiagnostico", en: "/self-assessment", ca: "/autodiagnostic" },
  autodiagnostic:   { es: "/autodiagnostico", en: "/self-assessment", ca: "/autodiagnostic" },
};

export function getLocalizedPathname(pathname: string, targetLocale: string): string {
  const slug = pathname.replace(/^\//, "").split("/")[0];
  const equivalences = SLUG_EQUIVALENCES[slug];
  if (equivalences) return equivalences[targetLocale] ?? pathname;
  return pathname;
}
