import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SolutionPageSections } from "@/components/sections/solution/SolutionPageSections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("solutionPage.metadata");
  const localeMap: Record<string, string> = { es: "es_ES", en: "en_US", ca: "ca_ES" };
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `https://yutopias.com/${locale}/solution`,
      languages: {
        es: "https://yutopias.com/es/solution",
        en: "https://yutopias.com/en/solution",
        ca: "https://yutopias.com/ca/solution",
        "x-default": "https://yutopias.com/es/solution",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://yutopias.com/${locale}/solution`,
      siteName: "Yūtopias Systems",
      locale: localeMap[locale] ?? "es_ES",
      type: "website",
      images: [
        {
          url: "https://yutopias.com/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://yutopias.com/og-image.png"],
    },
  };
}

export default async function SolutionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SolutionPageSections />;
}
