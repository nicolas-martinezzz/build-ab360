import { getTranslations } from "next-intl/server";
import { SiteHeaderBar } from "@/components/sections/SiteHeaderBar";

export const SiteHeader = async () => {
  const t = await getTranslations("nav");

  return (
    <SiteHeaderBar
      about={t("about")}
      brandAria={t("brandAria")}
      challenge={t("challenge")}
      closeMenuLabel={t("closeMenu")}
      drawerLinksNavAria={t("mobileDrawerLinksAria")}
      joinBootcamp={t("joinBootcamp")}
      mainNavAria={t("mainNavAria")}
      mobileMenuAria={t("mobileMenuAria")}
      openMenuLabel={t("openMenu")}
      program={t("program")}
      solution={t("solution")}
    />
  );
};
