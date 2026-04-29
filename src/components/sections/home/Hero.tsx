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
      className="relative flex min-h-screen min-h-dvh items-center py-24 sm:py-28 md:py-32"
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
        <MediaBackdrop opacity={0.8} />
      </div>
      <SectionContainer className="relative z-10 text-left">
        {eyebrow ? (
          <p className="type-eyebrow mb-[0.875rem] text-green-200">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className="figma-title-1 max-w-[62.5625rem] text-white [overflow-wrap:anywhere]"
          id="hero-heading"
        >
          {t("headline")}
        </h1>
        {subhead ? (
          <p className="figma-text-l mt-[1.375rem] max-w-[52.5rem] whitespace-pre-line text-white/85">
            {subhead}
          </p>
        ) : null}
        <LinkButton
          className="mt-[1.375rem] w-full max-w-sm sm:w-auto"
          href={SITE_PATHS.contact}
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
