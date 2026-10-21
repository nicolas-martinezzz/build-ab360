import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
      {/*
        The announcement bar is hidden site-wide (20/10/2026). It invited people
        to sign up for the Bootcamp Zero of 22/10/2026, which reads wrong once
        the event is upon us — and plain stale after it.

        Hidden, not deleted: the component and its nav.announcementText /
        nav.announcementLinkLabel copy are untouched, so bringing it back for the
        next event is putting <AnnouncementBar /> back inside this spacer. The
        spacer itself stays either way: it is what clears the fixed header.
      */}
      <div style={{ paddingTop: "var(--header-h)" }} />
      <main className="min-w-0" id="main-content">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
