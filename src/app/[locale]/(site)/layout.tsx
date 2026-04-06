import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

type Props = {
  children: ReactNode;
};

export default async function SiteLayout({ children }: Props) {
  const t = await getTranslations("nav");

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("skipToContent")}
      </a>
      <SiteHeader />
      <main className="min-w-0" id="main-content">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
