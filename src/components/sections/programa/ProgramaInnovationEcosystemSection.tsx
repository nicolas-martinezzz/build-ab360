import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

type LogoTileProps = {
  logoSrc: string;
  logoAlt: string;
  wide?: boolean;
  secondaryLogoSrc?: string;
  secondaryLogoAlt?: string;
};

const LogoTile = ({
  logoSrc,
  logoAlt,
  wide = false,
  secondaryLogoSrc,
  secondaryLogoAlt,
}: LogoTileProps) => (
  <li
    className={
      wide
        ? "relative col-span-2 flex h-[5.5rem] sm:h-[6.75rem] items-center justify-between px-6"
        : "relative flex h-[5.5rem] sm:h-[6.75rem] items-center justify-center px-6"
    }
  >
    <Image
      alt=""
      aria-hidden
      className="object-cover"
      fill
      sizes={wide ? "420px" : "200px"}
      src={wide ? SITE_ASSETS.programa.ecosystemRectWide : SITE_ASSETS.programa.ecosystemRectSmall}
    />

    <div className={wide ? "relative z-10 flex w-full items-center justify-between" : "relative z-10"}>
      <Image
        alt={logoAlt}
        className={wide ? "h-auto w-auto max-w-[13.5rem]" : "h-auto w-auto max-w-[8.5rem]"}
        height={wide ? 56 : 48}
        src={logoSrc}
        width={wide ? 216 : 136}
      />

      {secondaryLogoSrc ? (
        <Image
          alt={secondaryLogoAlt ?? ""}
          className="h-auto w-auto max-w-[7rem]"
          height={44}
          src={secondaryLogoSrc}
          width={112}
        />
      ) : null}
    </div>
  </li>
);

export const ProgramaInnovationEcosystemSection = async () => {
  const t = await getTranslations("programaPage.ecosystem");

  return (
    <section aria-labelledby="programa-innovation-title" className="section-block-spacious bg-white">
      <SectionContainer>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26.25rem)] lg:gap-16">
          <div className="max-w-[40rem]">
            <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
            <h2 className="figma-title-2-bold mt-4 text-surface-bg" id="programa-innovation-title">{t("headline")}</h2>

            <div className="mt-8 space-y-6">
              <p className="figma-text-l text-surface-bg">{t("paragraph1")}</p>
              <p className="figma-text-l text-surface-bg">{t("paragraph2")}</p>
              <p className="figma-text-l text-surface-bg">{t("paragraph3")}</p>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-4">
            <LogoTile
              logoAlt="La Salle R&D"
              logoSrc={SITE_ASSETS.programa.ecosystemLasalleRd}
              secondaryLogoAlt="Technova Barcelona"
              secondaryLogoSrc={SITE_ASSETS.programa.ecosystemTechnova}
              wide
            />
            <LogoTile logoAlt="ACCIÓ" logoSrc={SITE_ASSETS.programa.ecosystemAccio} />
            <LogoTile logoAlt="GBCE" logoSrc={SITE_ASSETS.programa.ecosystemGbce} />
            <LogoTile logoAlt="ITeC" logoSrc={SITE_ASSETS.programa.ecosystemItec} />
            <LogoTile logoAlt="DIH4CAT" logoSrc={SITE_ASSETS.programa.ecosystemDih4cat} />
            <LogoTile logoAlt="IESE" logoSrc={SITE_ASSETS.programa.ecosystemIese} />
            <LogoTile
              logoAlt="Barcelona Contech Hub"
              logoSrc={SITE_ASSETS.programa.ecosystemBarcelonaContechHub}
            />
            <LogoTile logoAlt="Sngular" logoSrc={SITE_ASSETS.programa.ecosystemSngular} />
            <LogoTile
              logoAlt="Google for Startups"
              logoSrc={SITE_ASSETS.programa.ecosystemGoogleForStartups}
            />
          </ul>
        </div>
      </SectionContainer>
    </section>
  );
};
