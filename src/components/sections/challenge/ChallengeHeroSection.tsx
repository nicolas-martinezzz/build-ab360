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
      className="relative flex min-h-[100svh] items-end pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(6.5rem,env(safe-area-inset-top,0px)+5rem)] sm:pb-24 sm:pt-32 md:min-h-[85vh] md:items-center md:pb-32"
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
        <MediaBackdrop opacity={0.3} />
      </div>

      <SectionContainer className="relative z-10 text-left">
        <h1
          className="max-w-4xl whitespace-pre-line text-2xl font-semibold leading-[1.2] text-white [overflow-wrap:anywhere] sm:text-3xl md:text-4xl md:leading-tight lg:text-5xl"
          id="challenge-title"
        >
          {t("headline")}
        </h1>
        <p className="mt-4 max-w-3xl text-[0.9375rem] leading-relaxed text-white/85 sm:mt-6 sm:text-base md:text-lg">
          {t("body")}
        </p>
        <LinkButton className="mt-6 min-h-12 w-full max-w-sm px-6 sm:mt-8 sm:w-auto" href={SITE_PATHS.contact} variant="primary">
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
