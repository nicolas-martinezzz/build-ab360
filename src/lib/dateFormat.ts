export const getDateLocale = (locale: string): string =>
  locale === "ca" ? "ca-ES" : locale === "en" ? "en-GB" : "es-ES";

export const formatArticleDate = (iso: string, locale: string): string =>
  new Date(iso).toLocaleDateString(getDateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
