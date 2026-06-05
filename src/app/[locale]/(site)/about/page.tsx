import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutPageSections } from "@/components/sections/about/AboutPageSections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage.metadata");
  const localeMap: Record<string, string> = { es: "es_ES", en: "en_US", ca: "ca_ES" };
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `https://yutopias.com/${locale}/about`,
      languages: {
        es: "https://yutopias.com/es/nosotros",
        en: "https://yutopias.com/en/about",
        ca: "https://yutopias.com/ca/nosaltres",
        "x-default": "https://yutopias.com/es/nosotros",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://yutopias.com/${locale}/about`,
      siteName: "Yūtopias Systems",
      locale: localeMap[locale] ?? "es_ES",
      type: "website",
      images: [{ url: "https://yutopias.com/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://yutopias.com/og-image.png"] },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutPageSections />;
}
