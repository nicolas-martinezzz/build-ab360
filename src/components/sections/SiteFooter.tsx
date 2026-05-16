import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS, getDiagnosticPathByLocale, getBootcampPathByLocale } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { FooterNewsletterForm } from "@/components/sections/FooterNewsletterForm";
import { FooterLocaleSwitcher } from "@/components/sections/FooterLocaleSwitcher";

export const SiteFooter = async () => {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const diagnosticPath = getDiagnosticPathByLocale(locale);
  const bootcampPath = getBootcampPathByLocale();

  return (
    <footer
      className="border-t border-white/10 bg-surface-bg text-white"
      id="site-footer"
      role="contentinfo"
    >
      <SectionContainer className="py-12 sm:py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr] lg:gap-12">

          {/* Col 1: Logo + Contact + Social */}
          <div className="flex flex-col gap-5">
            <Link
              aria-label="yūtopias systems — inicio"
              className="inline-block text-lg font-medium"
              href={SITE_PATHS.home}
            >
              <span className="text-green-300">yūtopias</span>{" "}
              <span className="font-medium text-white/90">systems</span>
            </Link>

            <div className="flex flex-col gap-5 sm:flex-row lg:flex-col">
              <div>
                <p className="text-sm font-medium text-white">{t("barcelonaTitle")}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{t("barcelonaAddress1")}</p>
                <p className="text-sm leading-relaxed text-white/70">{t("barcelonaAddress2")}</p>
                <p className="mt-1 text-sm text-white/80">{t("barcelonaPhone")}</p>
                <a
                  className="text-sm text-white/80 transition hover:text-white"
                  href={`mailto:${t("barcelonaEmail")}`}
                >
                  {t("barcelonaEmail")}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t("madridTitle")}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{t("madridAddress1")}</p>
                <p className="text-sm leading-relaxed text-white/70">{t("madridAddress2")}</p>
                <p className="mt-1 text-sm text-white/80">{t("madridPhone")}</p>
                <a
                  className="text-sm text-white/80 transition hover:text-white"
                  href={`mailto:${t("madridEmail")}`}
                >
                  {t("madridEmail")}
                </a>
              </div>
            </div>

            <Link
              className="hidden h-10 w-fit items-center rounded-[5px] bg-green-500 px-5 text-sm font-semibold text-white transition hover:bg-green-600"
              href={SITE_PATHS.contact}
            >
              {t("hablamos")}
            </Link>

            <div className="flex gap-3">
              <a
                aria-label={t("linkedinAria")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                href={t("linkedinUrl")}
                rel="noreferrer noopener"
                target="_blank"
              >
                <svg aria-hidden className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.82v1.64h.05c.53-1 1.84-2.06 3.8-2.06 4.06 0 4.81 2.67 4.81 6.14V21h-4v-5.5c0-1.31-.02-2.99-1.82-2.99-1.82 0-2.1 1.42-2.1 2.9V21h-4V9Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: PILARES */}
          <nav aria-label={t("pilarsNavAria")} className="flex min-w-0 flex-col gap-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50">
              {t("pilarsTitle")}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.challenge}>
                {t("challenge")}
              </Link>
              <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.solution}>
                {t("solution")}
              </Link>
              <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.programa}>
                {t("program")}
              </Link>
              <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.about}>
                {t("about")}
              </Link>
            </div>
          </nav>

          {/* Col 3: ACCIÓN + RECURSOS */}
          <div className="flex min-w-0 flex-col gap-7">
            <nav aria-label={t("actionNavAria")} className="flex flex-col gap-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50">
                {t("actionTitle")}
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Link className="text-white/75 transition hover:text-white" href={bootcampPath}>
                  {t("joinBootcamp")}
                </Link>
                <Link className="text-white/75 transition hover:text-white" href={diagnosticPath}>
                  {t("selfDiagnostic")}
                </Link>
              </div>
            </nav>
            <Link
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50 transition hover:text-white"
              href={SITE_PATHS.resources}
            >
              {t("resourcesTitle")}
            </Link>
          </div>

          {/* Col 4: Newsletter */}
          <div className="flex min-w-0 flex-col gap-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50">
              {t("newsletterTitle")}
            </p>
            <p className="text-sm leading-relaxed text-white/70">{t("newsletterSubtitle")}</p>
            <FooterNewsletterForm
              botBlockedMessage={t("newsletterBotBlockedMessage")}
              emailPlaceholder={t("emailPlaceholder")}
              errorMessage={t("newsletterErrorMessage")}
              namePlaceholder={t("namePlaceholder")}
              privacyCheck={t("privacyCheck")}
              privacyHref={SITE_PATHS.privacy}
              privacyPolicyLabel={t("privacyLink")}
              successMessage={t("newsletterSuccessMessage")}
              subscribeButton={t("subscribeButton")}
            />
          </div>
        </div>
      </SectionContainer>

      {/* Credit line */}
      <SectionContainer>
        <p className="text-right text-sm text-white/40">
          {t("creditLine")}{" "}
          <a
            className="text-white/60 transition hover:text-white"
            href="https://www.linkedin.com/company/yutopias/posts/?feedView=all"
            rel="noreferrer noopener"
            target="_blank"
          >
            YUTOPIAS SYSTEMS S.L.
          </a>
          {" "}{t("creditAnd")}{" "}
          <a
            className="text-white/60 transition hover:text-white"
            href="https://www.linkedin.com/in/martineznae/"
            rel="noreferrer noopener"
            target="_blank"
          >
            Nicolas Martinez
          </a>
        </p>
      </SectionContainer>

      {/* Bottom bar */}
      <SectionContainer className="mt-5 border-t border-white/10 pt-5 pb-6 sm:mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-white/50">
            {t("copyright")}
          </p>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-1 gap-y-1 text-sm text-white/50">
              <Link
                className="underline-offset-2 transition hover:text-white hover:underline"
                href={SITE_PATHS.information}
              >
                {t("informationLink")}
              </Link>
              <span aria-hidden className="select-none px-1">·</span>
              <Link className="underline-offset-2 transition hover:text-white hover:underline" href={SITE_PATHS.privacy}>
                {t("privacyLink")}
              </Link>
              <span aria-hidden className="select-none px-1">·</span>
              <Link className="underline-offset-2 transition hover:text-white hover:underline" href={SITE_PATHS.cookies}>
                {t("cookiesLink")}
              </Link>
            </nav>
            <FooterLocaleSwitcher
              ariaLabel={t("localeNavAria")}
              localeCa={t("localeCa")}
              localeEn={t("localeEn")}
              localeEs={t("localeEs")}
            />
          </div>
        </div>
      </SectionContainer>

      {/* Kit Digital */}
      <SectionContainer className="pb-8 pt-4 sm:pb-10">
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
