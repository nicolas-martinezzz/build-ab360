import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { FooterNewsletterForm } from "@/components/sections/FooterNewsletterForm";
import { FooterLocaleSwitcher } from "@/components/sections/FooterLocaleSwitcher";

export const SiteFooter = async () => {
  const t = await getTranslations("footer");

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
              className="inline-flex h-10 w-fit items-center rounded-[5px] bg-green-500 px-5 text-sm font-semibold text-white transition hover:bg-green-600"
              href={SITE_PATHS.contact}
            >
              {t("hablamos")}
            </Link>

            <div className="flex gap-3">
              <a
                aria-label={t("linkedinAria")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                href={t("linkedinUrl")}
                rel="noreferrer"
                target="_blank"
              >
                <svg aria-hidden className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.82v1.64h.05c.53-1 1.84-2.06 3.8-2.06 4.06 0 4.81 2.67 4.81 6.14V21h-4v-5.5c0-1.31-.02-2.99-1.82-2.99-1.82 0-2.1 1.42-2.1 2.9V21h-4V9Z" />
                </svg>
              </a>
              <a
                aria-label={t("instagramAria")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                href={t("instagramUrl")}
                rel="noreferrer"
                target="_blank"
              >
                <svg aria-hidden className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                aria-label={t("youtubeAria")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                href={t("youtubeUrl")}
                rel="noreferrer"
                target="_blank"
              >
                <svg aria-hidden className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
                <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.programa}>
                  {t("joinBootcamp")}
                </Link>
                <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.challenge}>
                  {t("selfDiagnostic")}
                </Link>
              </div>
            </nav>
            <nav aria-label={t("resourcesNavAria")} className="flex flex-col gap-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50">
                {t("resourcesTitle")}
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.resources}>
                  {t("blog")}
                </Link>
                <Link className="text-white/75 transition hover:text-white" href={SITE_PATHS.resources}>
                  {t("ebooks")}
                </Link>
              </div>
            </nav>
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
          <span className="text-white/60">{t("creditAuthor")}</span>
        </p>
      </SectionContainer>

      {/* Bottom bar */}
      <SectionContainer className="mt-5 border-t border-white/10 pt-5 pb-6 sm:mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-white/50">
            {t("copyright", { year: new Date().getFullYear() })}
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
