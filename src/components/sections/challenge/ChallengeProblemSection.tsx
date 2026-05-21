import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

export const ChallengeProblemSection = async () => {
  const t = await getTranslations("challengePage.nextSection");
  const problemCards = [
    {
      title: t("problemCards.card1.title"),
      body: t("problemCards.card1.body"),
    },
    {
      title: t("problemCards.card2.title"),
      body: t("problemCards.card2.body"),
    },
    {
      title: t("problemCards.card3.title"),
      body: t("problemCards.card3.body"),
    },
  ] as const;

  const evidenceCards = [
    {
      quote: t("evidenceCards.card1.quote"),
      source: t("evidenceCards.card1.source"),
    },
    {
      quote: t("evidenceCards.card2.quote"),
      source: t("evidenceCards.card2.source"),
    },
    {
      quote: t("evidenceCards.card3.quote"),
      source: t("evidenceCards.card3.source"),
    },
  ] as const;

  return (
    <section aria-labelledby="challenge-problem-title" className="section-block-spacious bg-white">
      <SectionContainer>
        <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
        <h2 className="figma-title-2-bold mt-2 text-black" id="challenge-problem-title">
          {t("titleLine1")}
        </h2>
        <p className="figma-title-2-bold text-black">
          {t("titleLine2Prefix")} <span className="text-green-500">{t("titleLine2Costes")}</span>,{" "}
          <span className="text-green-500">{t("titleLine2Huellas")}</span> {t("titleLine2Connector")}{" "}
          <span className="text-green-500">{t("titleLine2Errores")}</span>.
        </p>

        <div className="mt-[4.625rem] grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {problemCards.map((card) => (
            <article className="min-w-0" key={card.title}>
              {/* eslint-disable-next-line @next/next/no-img-element -- asset mirrors exact Figma icon */}
              <img
                alt=""
                aria-hidden
                className="mb-6 h-10 w-10 object-contain sm:h-[51px] sm:w-[51px]"
                height={51}
                src={SITE_ASSETS.challenge.scanSearchIcon}
                width={51}
              />
              <h3 className="max-w-[23.5rem] whitespace-pre-line figma-text-l-bold text-black">{card.title}</h3>
              <p className="figma-text-l mt-1 text-black">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-[2.5rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evidenceCards.map((card) => (
            <article className="rounded-[5px] border border-grey-light bg-surface-bg p-[1.875rem] text-white" key={card.quote}>
              <p className="figma-text-l-bold text-white">{card.quote}</p>
              <p className="mt-5 text-[0.8125rem] italic leading-[1.4] text-grey-light underline decoration-grey-light underline-offset-2">
                {card.source}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-[6.375rem] text-center">
          <p className="whitespace-pre-line figma-title-3 text-black">{t("closingLine1")}</p>
          <p className="figma-title-3 text-green-500">{t("closingLine2")}</p>
        </div>
      </SectionContainer>
    </section>
  );
};
