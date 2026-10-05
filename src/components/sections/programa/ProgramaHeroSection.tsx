import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { BOOTCAMP_ZERO_CTA_HREF } from "@/config/routes";
import { ProgramaHeroBottomBanner } from "./ProgramaLogosStrip";

export const ProgramaHeroSection = async () => {
  const [t, locale] = await Promise.all([
    getTranslations("programaPage.hero"),
    getLocale(),
  ]);

  // Bootcamp Zero × APCE Catalunya campaign (until 22/10/2026): new hero
  // content is es-only. /en/program and /ca/programa keep the OpenLab hero
  // unchanged. See odd/tasks/bootcamp-zero-programa.md.
  const isBootcampZeroHero = locale === "es";

  return (
    <section
      aria-labelledby="programa-hero-heading"
      className="relative flex min-h-screen min-h-dvh items-center overflow-hidden py-24 sm:py-28 md:py-32"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-br from-surface-bg via-surface-bg to-green-900/40 motion-reduce:block"
        />
        <Image
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          decoding="async"
          fill
          priority
          sizes="100vw"
          src={SITE_ASSETS.programa.heroBackground}
        />
        <MediaBackdrop opacity={0.72} />
      </div>

      <SectionContainer className="relative z-10">
        {isBootcampZeroHero ? (
          <>
            <p className="type-eyebrow text-green-300">{t("bootcampEyebrow")}</p>

            <h1
              className="figma-title-1 mt-4 max-w-[44rem] text-white"
              id="programa-hero-heading"
            >
              {t("bootcampTitle")}
            </h1>

            <p className="figma-text-l mt-4 max-w-[40rem] font-medium text-white/90">
              {t("bootcampSubtitle")}
            </p>

            <p className="figma-text-l mt-5 max-w-[43rem] text-white/85">
              {t("bootcampBody")}
            </p>

            <div className="mt-8 flex flex-col items-start gap-3">
              <span className="figma-text-m text-white/70">{t("bootcampCollaboration")}</span>
              <Image
                alt="APCE, Associació de Promotors de Catalunya"
                className="h-[72px] w-auto sm:h-[107px]"
                height={160}
                src={SITE_ASSETS.programa.bootcampZero.apceLogoWhite}
                width={460}
              />
            </div>
          </>
        ) : (
          <>
            <p className="type-eyebrow text-green-300">{t("eyebrow")}</p>

            <h1
              className="figma-title-1 mt-4 max-w-[44rem] text-white"
              id="programa-hero-heading"
            >
              {t("headline")}
            </h1>

            <p className="figma-text-l mt-5 max-w-[43rem] text-white/85">
              {t.rich("body", {
                lasalle: (chunks) => (
                  <a
                    className="underline underline-offset-2 hover:opacity-80"
                    href="https://www.salleurl.edu/es/la-salle-y-la-investigacion"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {chunks}
                  </a>
                ),
                accio: (chunks) => (
                  <a
                    className="underline underline-offset-2 hover:opacity-80"
                    href="https://www.accio.gencat.cat/ca/serveis/innovacio/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>

            <LinkButton
              className="mt-7 w-full sm:w-auto"
              external
              href={BOOTCAMP_ZERO_CTA_HREF}
              variant="primary"
            >
              {t("cta")}
            </LinkButton>
          </>
        )}
      </SectionContainer>

      {isBootcampZeroHero ? null : (
        <div className="absolute inset-x-0 bottom-0 z-20">
          <ProgramaHeroBottomBanner />
        </div>
      )}
    </section>
  );
};
