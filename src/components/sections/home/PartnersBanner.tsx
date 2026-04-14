import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getButtonClassName } from "@/components/ui/Button";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { homeSectionHref } from "@/config/routes";
import { Link } from "@/i18n/navigation";

const renderLogoRow = (keyPrefix: string) =>
  SITE_ASSETS.home.earlyAdopterLogos.map((logoPath, index) => (
    <li
      key={`${keyPrefix}-${index}`}
      aria-hidden
      className="partners-marquee__logo-item flex shrink-0 items-center justify-center"
    >
      <div className="partners-marquee__logo-shell">
        <Image
          alt=""
          aria-hidden
          className="h-10 w-32 object-contain opacity-90 sm:h-11 sm:w-40"
          height={44}
          src={logoPath}
          width={160}
        />
      </div>
    </li>
  ));

export const PartnersBanner = async () => {
  const t = await getTranslations("home.partners");

  return (
    <section
      aria-labelledby="partners-marquee-title"
      className="bg-surface-bg py-16 text-white sm:py-20 md:py-24"
    >
      <SectionContainer>
        <h2
          className="figma-text-l text-left text-white [overflow-wrap:anywhere]"
          id="partners-marquee-title"
        >
          {t("intro")}
        </h2>

        <div
          aria-label={t("marqueeAria")}
          className="partners-marquee mt-8 sm:mt-10"
          role="region"
        >
          <ul className="partners-marquee__track m-0 list-none p-0">
            {renderLogoRow("a")}
            {renderLogoRow("b")}
          </ul>
        </div>

        <div className="mt-12 flex justify-center px-2 sm:mt-14 md:mt-16">
          <Link className={getButtonClassName("outlineInverse", "px-8")} href={homeSectionHref("program")}>
            {t("cta")}
          </Link>
        </div>
      </SectionContainer>
    </section>
  );
};
