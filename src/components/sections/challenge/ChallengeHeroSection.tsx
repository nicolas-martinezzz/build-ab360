import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { getDiagnosticPathByLocale } from "@/config/routes";

export const ChallengeHeroSection = async () => {
  const locale = await getLocale();
  const t = await getTranslations("challengePage");
  const diagnosticPath = getDiagnosticPathByLocale(locale);

  return (
    <section
      aria-labelledby="challenge-title"
      className="relative flex min-h-screen min-h-dvh items-center py-24 sm:py-28 md:py-32"
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
        <MediaBackdrop opacity={0.62} />
      </div>

      <SectionContainer className="relative z-10 text-left">
        <h1
          className="figma-title-1 max-w-[58rem] whitespace-pre-line leading-[1.12] text-white [overflow-wrap:anywhere]"
          id="challenge-title"
        >
          {t("headline")}
        </h1>
        <p className="figma-text-l mt-8 max-w-[52rem] whitespace-pre-line text-white/88">
          {t("body")}
        </p>
        <LinkButton
          className="mt-8 w-full max-w-sm sm:w-auto"
          href={diagnosticPath}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
        <p className="figma-text-m mt-3 italic text-white/80">
          {t("hint")}
        </p>
      </SectionContainer>
    </section>
  );
};
