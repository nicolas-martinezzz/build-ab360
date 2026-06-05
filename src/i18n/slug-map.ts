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

const LOCALES = ["es", "en", "ca"] as const;

export function getLocalizedPathname(pathname: string, targetLocale: string): string {
  const queryIndex = pathname.indexOf("?");
  const hashIndex = pathname.indexOf("#");
  const cutIndex = [queryIndex, hashIndex].filter((n) => n >= 0).sort((a, b) => a - b)[0] ?? pathname.length;
  const basePath = pathname.slice(0, cutIndex);
  const suffix = pathname.slice(cutIndex);

  const trimmed = basePath.replace(/^\/+|\/+$/g, "");
  const segments = trimmed.split("/").filter(Boolean);
  const pathSegments = LOCALES.includes(segments[0] as typeof LOCALES[number]) ? segments.slice(1) : segments;

  const first = pathSegments[0] ?? "";
  const rest = pathSegments.slice(1);
  const equivalences = SLUG_EQUIVALENCES[first];
  const localizedFirst = equivalences ? equivalences[targetLocale] : first ? `/${first}` : "";
  const localizedPath = localizedFirst ? `${localizedFirst}${rest.length > 0 ? `/${rest.join("/")}` : ""}` : "/";

  return localizedPath + suffix;
}
