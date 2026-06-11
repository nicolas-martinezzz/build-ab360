import { getLocale, getTranslations } from "next-intl/server";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_SECTION_IDS, getDiagnosticPathByLocale } from "@/config/routes";
import { HeroBackdropGif } from "./HeroBackdropGif";

export const Hero = async () => {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home.hero")]);
  const eyebrow = t("eyebrow").trim();
  const subhead = t("subhead").trim();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex h-dvh min-h-[600px] items-center py-20 sm:py-24 md:py-28"
      id={SITE_SECTION_IDS.challenge}
    >
      <div className="absolute inset-0 overflow-hidden bg-surface-bg">
        {/* Solid fallback — visible immediately, before GIF loads */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-surface-bg via-surface-bg to-green-900/40"
        />
        <HeroBackdropGif mp4={SITE_ASSETS.home.heroBackgroundMp4} webm={SITE_ASSETS.home.heroBackgroundWebm} />
        <MediaBackdrop opacity={0.8} />
      </div>
      <SectionContainer className="relative z-10 text-left">
        {/* SEO H1: keyword-rich, always visible — Google reads this as the primary topic signal */}
        <h1 className="type-eyebrow mb-3 text-green-200">
          {t("seoH1")}
        </h1>
        {eyebrow ? (
          <p className="type-eyebrow mb-4 text-green-200">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className="figma-title-1 max-w-[62.5625rem] text-white [overflow-wrap:anywhere]"
          id="hero-heading"
        >
          {t("headline")}
        </h2>
        {subhead ? (
          <p className="figma-text-l mt-5 max-w-[52.5rem] whitespace-pre-line text-white/85">
            {subhead}
          </p>
        ) : null}
        <LinkButton
          className="mt-6 w-full max-w-sm sm:w-auto"
          href={getDiagnosticPathByLocale(locale)}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
        <p className="figma-text-m mt-4 text-white/80">
          {t("hint")}
        </p>
      </SectionContainer>
    </section>
  );
};
