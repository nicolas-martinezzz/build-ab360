import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";

export const SolutionHeroSection = async () => {
  const t = await getTranslations("solutionPage.hero");

  return (
    <section
      aria-labelledby="solution-hero-heading"
      className="relative flex min-h-screen min-h-dvh items-center py-24 md:py-32 lg:py-36"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          alt=""
          aria-hidden
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={SITE_ASSETS.solution.heroBackground}
        />
        <MediaBackdrop opacity={0.5} />
      </div>

      <SectionContainer className="relative z-10">
        <div className="flex flex-wrap items-center gap-4">
          <p className="figma-text-l text-white">{t("eyebrow")}</p>
          <span className="figma-text-m rounded-[5px] border border-green-200 bg-white px-2.5 py-[3px] text-green-500">
            {t("badge")}
          </span>
        </div>

        <h1
          className="figma-title-1 mt-4 max-w-[62.5625rem] text-white [overflow-wrap:anywhere]"
          id="solution-hero-heading"
        >
          {t("headline")}
        </h1>

        <p className="figma-text-l mt-[1.375rem] max-w-[52.5rem] whitespace-pre-line text-white">
          {t("body")}
        </p>

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
