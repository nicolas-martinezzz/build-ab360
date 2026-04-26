import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";

export const ChallengeHeroSection = async () => {
  const t = await getTranslations("challengePage");

  return (
    <section
      aria-labelledby="challenge-title"
      className="relative flex min-h-[44.8125rem] items-end pb-16 pt-24 sm:pb-20 sm:pt-28 md:items-center md:pb-[6.875rem]"
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
          src={SITE_ASSETS.challenge.rectangle1}
        />
        <MediaBackdrop opacity={0.5} />
      </div>

      <SectionContainer className="relative z-10 text-left">
        <h1
          className="figma-title-1 max-w-[54.5625rem] whitespace-pre-line text-white [overflow-wrap:anywhere]"
          id="challenge-title"
        >
          {t("headline")}
        </h1>
        <p className="figma-text-l mt-5 max-w-[44.75rem] text-white">
          {t("body")}
        </p>
        <LinkButton
          className="mt-[2.375rem] w-full max-w-sm sm:w-auto"
          href={SITE_PATHS.contact}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
