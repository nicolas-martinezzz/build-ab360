import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

export const SolutionHeroSection = async () => {
  const t = await getTranslations("solutionPage.hero");

  return (
    <section
      aria-labelledby="solution-hero-heading"
      className="relative flex min-h-screen min-h-dvh items-center py-24 md:py-32 lg:py-36"
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

      <SectionContainer className="relative z-10">
        <div className="flex flex-wrap items-center gap-4">
          <p className="type-eyebrow text-white">{t("eyebrow")}</p>
          <span className="figma-text-m rounded-[5px] border border-green-200 bg-white px-2.5 py-1 text-green-500">
            {t("badge")}
          </span>
        </div>

        <h1
          className="figma-title-1 mt-4 max-w-[62.5625rem] text-white [overflow-wrap:anywhere]"
          id="solution-hero-heading"
        >
          {t("headline")}
        </h1>

        <p className="figma-text-m mt-3 font-semibold text-green-400">
          {t("collaborators")}
        </p>

        <p className="figma-text-l mt-5 max-w-[52.5rem] whitespace-pre-line text-white">
          {t("body")}
        </p>

        <p className="figma-text-l-bold mt-4 text-white">
          {t("ctaLabel")}
        </p>
        <LinkButton
          className="mt-3 w-full max-w-sm sm:w-auto"
          href="/autodiagnostico"
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
        <p className="figma-text-m mt-4 italic text-white/60">
          {t("hint")}
        </p>
      </SectionContainer>
    </section>
  );
};
