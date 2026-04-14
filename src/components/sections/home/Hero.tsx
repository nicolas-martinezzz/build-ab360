import { getTranslations } from "next-intl/server";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

export const Hero = async () => {
  const t = await getTranslations("home.hero");
  const eyebrow = t("eyebrow").trim();
  const subhead = t("subhead").trim();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] items-end pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(6.5rem,env(safe-area-inset-top,0px)+5rem)] sm:pb-24 sm:pt-32 md:min-h-[85vh] md:items-center md:pb-32"
      id={SITE_SECTION_IDS.challenge}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-br from-surface-bg via-surface-bg to-green-900/40 motion-reduce:block"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF hero backdrop */}
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          decoding="async"
          fetchPriority="high"
          src={SITE_ASSETS.home.heroBackgroundGif}
        />
        <MediaBackdrop opacity={0.78} />
      </div>
      <SectionContainer className="relative z-10 text-left">
        {eyebrow ? (
          <p className="type-eyebrow mb-2 text-green-200 sm:mb-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="figma-title-1 max-w-4xl text-white [overflow-wrap:anywhere]" id="hero-heading">
          {t("headline")}
        </h1>
        {subhead ? (
          <p className="figma-text-l mt-5 max-w-3xl whitespace-pre-line text-white/85 sm:mt-7 md:mt-8">
            {subhead}
          </p>
        ) : null}
        <LinkButton
          className="mt-6 min-h-12 w-full max-w-sm px-6 sm:mt-8 sm:w-auto"
          href={SITE_PATHS.contact}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
