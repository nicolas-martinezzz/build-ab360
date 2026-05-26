import { getTranslations } from "next-intl/server";
import { SiteHeaderBar } from "@/components/sections/SiteHeaderBar";
import { getBootcampPathByLocale } from "@/config/routes";

export const SiteHeader = async () => {
  const t = await getTranslations("nav");
  const tFooter = await getTranslations("footer");
  const bootcampPath = getBootcampPathByLocale();

  return (
    <SiteHeaderBar
      about={t("about")}
      resources={t("resources")}
      bootcampPath={bootcampPath}
      brandAria={t("brandAria")}
      challenge={t("challenge")}
      closeMenuLabel={t("closeMenu")}
      drawerLinksNavAria={t("mobileDrawerLinksAria")}
      joinBootcamp={t("joinBootcamp")}
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
