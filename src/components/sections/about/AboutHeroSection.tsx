import { getTranslations } from "next-intl/server";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

export const AboutHeroSection = async () => {
  const t = await getTranslations("aboutPage.hero");

  return (
    <section
      aria-labelledby="about-hero-title"
      className="relative flex min-h-screen min-h-dvh items-center py-24 text-white sm:py-28 md:py-32"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-br from-surface-bg via-surface-bg to-green-900/40 motion-reduce:block"
        />
        <video
          aria-hidden
          autoPlay
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          loop
          muted
          playsInline
          src={SITE_ASSETS.about.heroBackgroundVideo}
        />
        <MediaBackdrop opacity={0.72} />
      </div>

      <SectionContainer className="relative z-10">
        <p className="type-eyebrow text-white/75" aria-hidden>
          <span className="text-green-300">{t("brandPrimary")}</span>{" "}
          <span className="font-normal text-white/70">{t("brandSecondary")}</span>
        </p>
        <h1
          className="figma-title-1 mt-4 max-w-[62.5625rem] text-white [overflow-wrap:anywhere]"
          id="about-hero-title"
        >
          {t("title")}{" "}
          <em className="font-light italic">{t("titleAccent")}</em>
        </h1>
        <p className="figma-text-l mt-[1.375rem] max-w-[52.5rem] text-white/82">
          {t("body")}
        </p>
      </SectionContainer>
    </section>
  );
};
