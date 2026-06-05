import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DiagnosticHeroSection } from "@/components/diagnostic/DiagnosticHeroSection";
import { DiagnosticWizard } from "@/components/diagnostic/DiagnosticWizard";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("diagnosticPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://yutopias.com/${locale}/autodiagnostic`,
      languages: {
        es: "https://yutopias.com/es/autodiagnostico",
        en: "https://yutopias.com/en/self-assessment",
        ca: "https://yutopias.com/ca/autodiagnostic",
        "x-default": "https://yutopias.com/es/autodiagnostico",
      },
    },
  };
}

export default async function AutodiagnosticPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <DiagnosticHeroSection />
      <DiagnosticWizard locale={locale} />
    </>
  );
}
