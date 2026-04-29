import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";
import { ProgramaHeroBottomBanner } from "./ProgramaLogosStrip";

export const ProgramaHeroSection = async () => {
  const t = await getTranslations("programaPage.hero");

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
          src={SITE_ASSETS.challenge.rectangle1}
        />
        <MediaBackdrop opacity={0.55} />
      </div>

      <SectionContainer className="relative z-10">
        <p className="type-eyebrow text-green-300">{t("eyebrow")}</p>

        <h1
          className="figma-title-1 mt-4 max-w-[44rem] text-white"
          id="programa-hero-heading"
        >
          {t("headline")}
        </h1>

        <p className="figma-text-l mt-5 max-w-[43rem] text-white/85">
          {t("body")}
        </p>

        <LinkButton
          className="mt-7 w-full sm:w-auto"
          href={SITE_PATHS.contact}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <ProgramaHeroBottomBanner />
      </div>
    </section>
  );
};
