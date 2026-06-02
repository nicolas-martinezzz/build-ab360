import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnnouncementBar } from "@/components/sections/AnnouncementBar";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SiteLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("skipToContent")}
      </a>
      <SiteHeader />
      <div style={{ paddingTop: "var(--header-h)" }}>
        <AnnouncementBar />
      </div>
      <main className="min-w-0" id="main-content">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
