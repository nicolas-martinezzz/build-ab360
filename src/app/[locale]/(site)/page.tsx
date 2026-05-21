import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/home/Hero";
import { HomePageSections } from "@/components/sections/home/HomePageSections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages: { metadata?: { title?: string; description?: string } } =
    (await import(`@/messages/${locale}.json`)).default;

  const localeMap: Record<string, string> = { es: "es_ES", en: "en_US", ca: "ca_ES" };

  return {
    title: { absolute: messages.metadata?.title ?? "Yūtopias Systems" },
    description: messages.metadata?.description,
    alternates: {
      canonical: `https://yutopias.com/${locale}`,
      languages: {
        es: "https://yutopias.com/es",
        en: "https://yutopias.com/en",
        ca: "https://yutopias.com/ca",
        "x-default": "https://yutopias.com/es",
      },
    },
    openGraph: {
      title: messages.metadata?.title ?? "Yūtopias Systems",
      description: messages.metadata?.description,
      url: `https://yutopias.com/${locale}`,
      siteName: "Yūtopias Systems",
      locale: localeMap[locale] ?? "es_ES",
      type: "website",
      images: [
        {
          url: "https://yutopias.com/og-image.png",
          width: 1200,
          height: 630,
          alt: "Yūtopias Systems — Decisiones con impacto medible",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: messages.metadata?.title ?? "Yūtopias Systems",
      description: messages.metadata?.description,
      images: ["https://yutopias.com/og-image.png"],
    },
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Yūtopias Systems",
  url: "https://yutopias.com",
  logo: "https://yutopias.com/icon.png",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://yutopias.com/es/contact",
  },
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        type="application/ld+json"
      />
      <div className="relative bg-surface-bg">
        <Hero locale={locale} />
      </div>
      <HomePageSections />
    </>
  );
}
