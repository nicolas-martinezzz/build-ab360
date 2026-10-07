import { getTranslations } from "next-intl/server";
import { SITE_ASSETS } from "@/config/assets";
import { ProgramaHeroSection } from "./ProgramaHeroSection";
import { ProgramaLogosStrip } from "./ProgramaLogosStrip";
import { ProgramaEcosystemSection } from "./ProgramaEcosystemSection";
import { ProgramaInnovationEcosystemSection } from "./ProgramaInnovationEcosystemSection";
import { ProgramaJourneySection } from "./ProgramaJourneySection";
import { ProgramaQuoteBanner } from "./ProgramaQuoteBanner";
import { ProgramaBootcampSection } from "./ProgramaBootcampSection";
import { ProgramaPartnersBanner } from "./ProgramaPartnersBanner";
import { ProgramaScheduleSection } from "./ProgramaScheduleSection";
import { ProgramaFormadoresSection, type Formador } from "./ProgramaFormadoresSection";
import { ProgramaOpenLabIntroSection } from "./ProgramaOpenLabIntroSection";

// Bootcamp Zero × APCE Catalunya (22/10/2026), es-only lineup — see
// odd/tasks/bootcamp-zero-programa.md. Built here (not inside
// ProgramaFormadoresSection) so the component's own default array, used
// unchanged by the en/ca embed inside ProgramaBootcampSection, stays
// untouched.
const ProgramaBootcampZeroSpeakers = async () => {
  const t = await getTranslations("programaPage.bootcampSpeakers");

  const speakers: Formador[] = [
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.juanjoMoreno,
      name: t("speaker1Name"),
      role: t("speaker1Role"),
      org: t("speaker1Org"),
      linkedin: "https://www.linkedin.com/in/juanjo-moreno/",
    },
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.ivanPerez,
      name: t("speaker2Name"),
      role: t("speaker2Role"),
      org: t("speaker2Org"),
      linkedin: "https://www.linkedin.com/in/ivan-perez-bar%C3%A9s-747a3848/",
    },
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.eduardoNunez,
      name: t("speaker3Name"),
      role: t("speaker3Role"),
      org: t("speaker3Org"),
      linkedin: "https://www.linkedin.com/in/eduardo-consultoria-facilities-management/",
    },
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.joseRamonMartinVega,
      name: t("speaker4Name"),
      role: t("speaker4Role"),
      org: t("speaker4Org"),
      linkedin: "https://www.linkedin.com/in/jramonmartinvega/",
    },
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.sandraColom,
      name: t("speaker5Name"),
      role: t("speaker5Role"),
      org: t("speaker5Org"),
      linkedin: "https://www.linkedin.com/in/sandra-colom-cabr%C3%A9-a48b38bb/",
    },
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.xavierVilajoana,
      name: t("speaker6Name"),
      role: t("speaker6Role"),
      org: t("speaker6Org"),
      linkedin: "https://www.linkedin.com/in/xaviervilajoana/",
    },
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.brunoSauer,
      name: t("speaker7Name"),
      role: t("speaker7Role"),
      org: t("speaker7Org"),
      linkedin: "https://www.linkedin.com/in/bruno-sauer/",
    },
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.javierMolina,
      name: t("speaker8Name"),
      role: t("speaker8Role"),
      org: t("speaker8Org"),
      linkedin: "https://www.linkedin.com/in/javiermolinacastillo/",
    },
    {
      avatar: SITE_ASSETS.programa.bootcampZero.speakers.josepMiquelPique,
      name: t("speaker9Name"),
      role: t("speaker9Role"),
      org: t("speaker9Org"),
      linkedin: "https://www.linkedin.com/in/josep-m-pique-807b66/",
    },
  ];

  return <ProgramaFormadoresSection headline={t("headline")} speakers={speakers} />;
};

type ProgramaPageSectionsProps = {
  locale: string;
};

// Bootcamp Zero × APCE Catalunya (until 22/10/2026): the campaign section
// order now applies to ALL locales (user decision of 07/10/2026 — see
// odd/tasks/bootcamp-zero-programa.md). Set CAMPAIGN_ACTIVE to false after
// 22/10 to restore the pre-campaign OpenLab order for every locale.
const CAMPAIGN_ACTIVE = true;

export const ProgramaPageSections = ({ locale }: ProgramaPageSectionsProps) => {
  void locale; // kept for the post-campaign revert (`locale === "es"` gate)
  if (CAMPAIGN_ACTIVE) {
    return (
      <>
        <ProgramaHeroSection />
        <ProgramaBootcampSection />
        <ProgramaScheduleSection />
        <ProgramaBootcampZeroSpeakers />
        <ProgramaOpenLabIntroSection />
        <ProgramaLogosStrip />
        <ProgramaEcosystemSection />
        <ProgramaInnovationEcosystemSection />
        <ProgramaJourneySection />
        <ProgramaQuoteBanner />
        <ProgramaPartnersBanner />
      </>
    );
  }

  return (
    <>
      <ProgramaHeroSection />
      <ProgramaLogosStrip />
      <ProgramaEcosystemSection />
      <ProgramaInnovationEcosystemSection />
      <ProgramaJourneySection />
      <ProgramaQuoteBanner />
      <ProgramaBootcampSection />
      <ProgramaPartnersBanner />
    </>
  );
};
