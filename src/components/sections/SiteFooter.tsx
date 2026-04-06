import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FooterLocaleSwitcher } from "@/components/sections/FooterLocaleSwitcher";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { homeSectionHref, SITE_PATHS } from "@/config/routes";
import { Link } from "@/i18n/navigation";

export const SiteFooter = async () => {
  const t = await getTranslations("footer");

  return (
    <footer
      className="border-t border-white/10 bg-surface-bg py-12 text-white sm:py-14"
      id="site-footer"
      role="contentinfo"
    >
      <SectionContainer className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <section className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{t("barcelonaTitle")}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{t("barcelonaAddress1")}</p>
          <p className="text-sm leading-relaxed text-white/70">{t("barcelonaAddress2")}</p>
          <p className="mt-2 text-sm text-white/80">{t("barcelonaPhone")}</p>
          <a className="text-sm text-white/80 transition hover:text-white" href={`mailto:${t("barcelonaEmail")}`}>
            {t("barcelonaEmail")}
          </a>
          <div className="mt-4">
            <a
              aria-label={t("linkedinAria")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white transition hover:bg-green-600"
              href={t("linkedinUrl")}
              rel="noreferrer"
              target="_blank"
            >
              <svg aria-hidden className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.82v1.64h.05c.53-1 1.84-2.06 3.8-2.06 4.06 0 4.81 2.67 4.81 6.14V21h-4v-5.5c0-1.31-.02-2.99-1.82-2.99-1.82 0-2.1 1.42-2.1 2.9V21h-4V9Z" />
              </svg>
            </a>
          </div>
        </section>

        <section className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{t("madridTitle")}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{t("madridAddress1")}</p>
          <p className="text-sm leading-relaxed text-white/70">{t("madridAddress2")}</p>
          <p className="mt-2 text-sm text-white/80">{t("madridPhone")}</p>
          <a className="text-sm text-white/80 transition hover:text-white" href={`mailto:${t("madridEmail")}`}>
            {t("madridEmail")}
          </a>
        </section>

        <nav aria-label={t("legalNavAria")} className="flex min-w-0 flex-col gap-2 text-sm">
          <p className="font-semibold text-white">{t("legalTitle")}</p>
          <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.privacy}>
            {t("privacy")}
          </Link>
          <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.cookies}>
            {t("cookies")}
          </Link>
          <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.contact}>
            {t("contact")}
          </Link>
          <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.information}>
            {t("information")}
          </Link>
        </nav>

        <nav aria-label={t("siteMapNavAria")} className="flex min-w-0 flex-col gap-2 text-sm">
          <p className="font-semibold text-white">{t("siteMapTitle")}</p>
          <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.home}>
            {t("home")}
          </Link>
          <Link className="text-white/75 transition hover:text-white" href={homeSectionHref("solution")}>
            {t("solution")}
          </Link>
          <Link className="text-white/75 transition hover:text-white" href={homeSectionHref("program")}>
            {t("program")}
          </Link>
          <Link className="text-white/75 transition hover:text-white" href={homeSectionHref("about")}>
            {t("about")}
          </Link>
        </nav>
      </SectionContainer>

      <SectionContainer className="mt-10 border-t border-white/10 pt-6 text-sm text-white/70 sm:mt-12">
        <div className="flex flex-col items-start gap-5 sm:items-center lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm leading-relaxed [overflow-wrap:anywhere]">{t("copyright", { year: new Date().getFullYear() })}</p>

          <FooterLocaleSwitcher
            ariaLabel={t("localeNavAria")}
            localeCa={t("localeCa")}
            localeEn={t("localeEn")}
            localeEs={t("localeEs")}
          />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-6 sm:mt-8">
        <Image
          alt={t("kitDigitalAlt")}
          className="h-auto w-full"
          height={348}
          priority={false}
          sizes="(max-width: 768px) 100vw, 860px"
          src={SITE_ASSETS.branding.kitDigitalLogo}
          width={1200}
        />
      </SectionContainer>
    </footer>
  );
};
