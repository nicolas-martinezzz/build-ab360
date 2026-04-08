import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

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
    <section className="bg-white py-16 sm:py-20 md:py-24">
      <SectionContainer>
        <p className="text-sm font-medium uppercase tracking-wide text-grey-dark">{t("eyebrow")}</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight text-surface-bg sm:text-4xl md:text-5xl">
          {t("titleLine1")}
        </h2>
        <p className="mt-2 text-3xl font-semibold leading-tight text-surface-bg sm:text-4xl md:text-5xl">
          {t("titleLine2Prefix")} <span className="text-green-500">{t("titleLine2Costes")}</span>,{" "}
          <span className="text-green-500">{t("titleLine2Huellas")}</span> {t("titleLine2Connector")}{" "}
          <span className="text-green-500">{t("titleLine2Errores")}</span>.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {problemCards.map((card) => (
            <article className="min-w-0" key={card.title}>
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-green-500/50 text-green-500">
                <svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M10.5 3h3M10.5 21h3M3 10.5v3M21 10.5v3M6 6l2 2M18 18l-2-2M18 6l-2 2M6 18l2-2M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <h3 className="max-w-xs whitespace-pre-line text-2xl font-semibold leading-snug text-surface-bg">{card.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-surface-bg/80">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {evidenceCards.map((card) => (
            <article className="rounded-md bg-surface-bg p-5 text-white sm:p-6" key={card.quote}>
              <p className="text-lg font-semibold leading-snug">{card.quote}</p>
              <p className="mt-4 text-sm leading-relaxed text-grey-light underline decoration-grey-light/60 underline-offset-2">
                {card.source}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center sm:mt-16">
          <p className="whitespace-pre-line text-3xl leading-tight text-surface-bg sm:text-4xl">{t("closingLine1")}</p>
          <p className="mt-2 text-3xl leading-tight text-green-500 sm:text-4xl">{t("closingLine2")}</p>
        </div>
      </SectionContainer>
    </section>
  );
};
