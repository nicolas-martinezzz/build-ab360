import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const localeMap: Record<string, string> = { es: "es_ES", en: "en_US", ca: "ca_ES" };
  return {
    title: "SimuLab — AB360",
    description:
      "Proyecta el impacto de tus decisiones antes de ejecutarlas. Integra BIM, ERP, GMAO y PMS en un gemelo digital semántico.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `https://yutopias.com/${locale}/simulab`,
    },
    openGraph: {
      title: "SimuLab — AB360 by Yūtopias",
      url: `https://yutopias.com/${locale}/simulab`,
      siteName: "Yūtopias Systems",
      locale: localeMap[locale] ?? "es_ES",
      type: "website",
    },
  };
}

export default async function SimulabPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="w-full">
      <div className="w-full overflow-hidden rounded-[10px] mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-20">
        <iframe
          className="h-[32rem] w-full sm:h-[40rem] lg:h-[56rem]"
          loading="eager"
          src="/simulab-teaser.html"
          title="SimuLab — Proyección de impacto de decisiones en gemelo digital"
        />
      </div>
    </section>
  );
}
