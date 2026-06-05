import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeaderBar } from "@/components/sections/SiteHeaderBar";
import { getBootcampPathByLocale } from "@/config/routes";

export const SiteHeader = async () => {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const tFooter = await getTranslations("footer");

  return (
    <SiteHeaderBar
      about={t("about")}
      resources={t("resources")}
      bootcampPath={getBootcampPathByLocale(locale)}
      brandAria={t("brandAria")}
      challenge={t("challenge")}
      closeMenuLabel={t("closeMenu")}
      drawerLinksNavAria={t("mobileDrawerLinksAria")}
      joinBootcamp={t("joinBootcamp")}
      locale={locale}
      localeCa={tFooter("localeCa")}
      localeEn={tFooter("localeEn")}
      localeEs={tFooter("localeEs")}
      localeNavAria={tFooter("localeNavAria")}
      mainNavAria={t("mainNavAria")}
      mobileMenuAria={t("mobileMenuAria")}
      openMenuLabel={t("openMenu")}
      program={t("program")}
      solution={t("solution")}
    />
  );
};
