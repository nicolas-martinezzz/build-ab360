import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

const CATEGORY_1_LOGOS = [
  { src: SITE_ASSETS.programa.ecosystemGoogleForStartups, alt: "Google for Startups" },
  { src: SITE_ASSETS.about.ecosystemEurecat, alt: "Eurecat" },
  { src: SITE_ASSETS.programa.ecosystemItec, alt: "ITeC" },
  { src: SITE_ASSETS.programa.ecosystemSngular, alt: "Sngular" },
] as const;

const CATEGORY_2_LOGOS = [
  { src: SITE_ASSETS.programa.ecosystemLasalleRd, alt: "La Salle R&D" },
  { src: SITE_ASSETS.programa.ecosystemTechnova, alt: "La Salle TechnovaBarcelona" },
  { src: SITE_ASSETS.about.ecosystemEoi, alt: "EOI" },
  { src: SITE_ASSETS.programa.ecosystemIese, alt: "IESE Business School" },
  { src: SITE_ASSETS.about.ecosystemEsade, alt: "Esade" },
] as const;

const CATEGORY_3_LOGOS = [
  { src: SITE_ASSETS.programa.ecosystemAccio, alt: "ACCIÓ Generalitat de Catalunya" },
  { src: SITE_ASSETS.programa.ecosystemBarcelonaContechHub, alt: "Barcelona ConTech Hub" },
  { src: SITE_ASSETS.programa.ecosystemGbce, alt: "GBCE" },
  { src: SITE_ASSETS.programa.ecosystemDih4cat, alt: "DIH4CAT" },
] as const;

const LogoGrid = ({
  logos,
}: {
  logos: ReadonlyArray<{ src: string; alt: string }>;
}) => (
  <ul className="mt-4 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4 md:gap-4">
    {logos.map((logo) => (
      <li
        key={logo.alt}
        className="flex h-[5.875rem] items-center justify-center rounded-[2px] bg-white px-3 py-2"
      >
        <Image
          alt={logo.alt}
          className="h-10 w-full object-contain"
          height={40}
          src={logo.src}
          width={120}
        />
      </li>
    ))}
  </ul>
);

export const AboutEcosystemSection = async () => {
  const t = await getTranslations("aboutPage.ecosystem");

  return (
    <section aria-labelledby="about-ecosystem-title" className="section-block bg-grey-light/35">
      <SectionContainer>
        <p className="type-eyebrow text-grey-dark/85">{t("eyebrow")}</p>
        <h2
          className="figma-title-2-bold mt-2.5 max-w-[38rem] text-surface-bg"
          id="about-ecosystem-title"
        >
          {t("title")}
        </h2>

        <div className="mt-10 space-y-9">
          <div>
            <p className="figma-title-3 text-surface-bg">{t("category1Label")}</p>
            <LogoGrid logos={CATEGORY_1_LOGOS} />
          </div>
          <div>
            <p className="figma-title-3 text-surface-bg">{t("category2Label")}</p>
            <LogoGrid logos={CATEGORY_2_LOGOS} />
          </div>
          <div>
            <p className="figma-title-3 text-surface-bg">{t("category3Label")}</p>
            <LogoGrid logos={CATEGORY_3_LOGOS} />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
