import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Inter, Montserrat } from "next/font/google";
import type { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { IntroOverlayLoader } from "@/components/ui/IntroOverlayLoader";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c1e2e",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages: { metadata?: { title?: string; description?: string } } =
    (await import(`@/messages/${locale}.json`)).default;

  const localeMap: Record<string, string> = { es: "es_ES", en: "en_US", ca: "ca_ES" };

  return {
    metadataBase: new URL("https://yutopias.com"),
    title: {
      default: messages.metadata?.title ?? "Yūtopias Systems",
      template: "%s | Yūtopias Systems",
    },
    description: messages.metadata?.description,
    alternates: {
      canonical: `https://yutopias.com/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
        ca: "/ca",
        "x-default": "/es",
      },
    },
    openGraph: {
      siteName: "Yūtopias Systems",
      locale: localeMap[locale] ?? "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@yutopias",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      className={`${montserrat.variable} ${inter.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased pb-[env(safe-area-inset-bottom,0px)]">
        {/* Blocks flash of page content before intro overlay mounts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!sessionStorage.getItem('intro-seen'))document.body.style.background='#000'}catch(e){}})()`,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <IntroOverlayLoader />
          {children}
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
