import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";

export default async function ChallengePage() {
  const t = await getTranslations("challengePage");
  const problemCards = [
    {
      title: t("nextSection.problemCards.card1.title"),
      body: t("nextSection.problemCards.card1.body"),
    },
    {
      title: t("nextSection.problemCards.card2.title"),
      body: t("nextSection.problemCards.card2.body"),
    },
    {
      title: t("nextSection.problemCards.card3.title"),
      body: t("nextSection.problemCards.card3.body"),
    },
  ] as const;

  const evidenceCards = [
    {
      quote: t("nextSection.evidenceCards.card1.quote"),
      source: t("nextSection.evidenceCards.card1.source"),
    },
    {
      quote: t("nextSection.evidenceCards.card2.quote"),
      source: t("nextSection.evidenceCards.card2.source"),
    },
    {
      quote: t("nextSection.evidenceCards.card3.quote"),
      source: t("nextSection.evidenceCards.card3.source"),
    },
  ] as const;
  return (
    <>
      <section
        aria-labelledby="challenge-title"
        className="relative flex min-h-[100svh] items-end pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(6.5rem,env(safe-area-inset-top,0px)+5rem)] sm:pb-24 sm:pt-32 md:min-h-[85vh] md:items-center md:pb-32"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 hidden bg-gradient-to-br from-surface-bg via-surface-bg to-green-900/40 motion-reduce:block"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF hero backdrop */}
          <img
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            decoding="async"
            fetchPriority="high"
            src={SITE_ASSETS.home.heroBackgroundGif}
          />
          <MediaBackdrop opacity={0.78} />
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
          <LinkButton
            className="mt-6 min-h-12 w-full max-w-sm px-6 sm:mt-8 sm:w-auto"
            href={SITE_PATHS.contact}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </SectionContainer>
      </section>

      <section className="bg-white py-16 sm:py-20 md:py-24">
        <SectionContainer>
          <p className="text-sm font-medium uppercase tracking-wide text-grey-dark">{t("nextSection.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-surface-bg sm:text-4xl md:text-5xl">
            {t("nextSection.titleLine1")}
          </h2>
          <p className="mt-2 text-3xl font-semibold leading-tight text-surface-bg sm:text-4xl md:text-5xl">
            {t("nextSection.titleLine2Prefix")}{" "}
            <span className="text-green-500">{t("nextSection.titleLine2Costes")}</span>,{" "}
            <span className="text-green-500">{t("nextSection.titleLine2Huellas")}</span>{" "}
            {t("nextSection.titleLine2Connector")} <span className="text-green-500">{t("nextSection.titleLine2Errores")}</span>.
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
            <p className="whitespace-pre-line text-3xl leading-tight text-surface-bg sm:text-4xl">{t("nextSection.closingLine1")}</p>
            <p className="mt-2 text-3xl leading-tight text-green-500 sm:text-4xl">{t("nextSection.closingLine2")}</p>
          </div>
        </SectionContainer>
      </section>

      <section className="bg-green-100 py-16 sm:py-20 md:py-24">
        <SectionContainer>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-10">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-grey-dark sm:text-sm">{t("todaySection.eyebrow")}</p>
              <h2 className="mt-4 max-w-3xl whitespace-pre-line text-3xl font-semibold leading-tight text-surface-bg sm:text-4xl md:text-5xl">
                {t("todaySection.headline")}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-surface-bg/80 sm:text-lg">{t("todaySection.paragraph1")}</p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-surface-bg/80 sm:text-lg">{t("todaySection.paragraph2")}</p>

              <article className="mt-8 max-w-3xl border-l-2 border-green-500 pl-4 sm:pl-5">
                <h3 className="text-3xl font-semibold leading-tight text-green-500 sm:text-4xl">
                  {t("todaySection.taxonomy.title")}
                </h3>
                <p className="mt-2 text-2xl leading-tight text-green-500 sm:text-3xl">{t("todaySection.taxonomy.body")}</p>
                <p className="mt-3 text-sm text-green-500/80 underline decoration-green-500/60 underline-offset-2">
                  {t("todaySection.taxonomy.source")}
                </p>
              </article>
            </div>

            <div className="mx-auto w-full max-w-md lg:pt-2">
              <Image
                alt={t("todaySection.pillarsImageAlt")}
                className="h-auto w-full"
                height={956}
                priority={false}
                src={SITE_ASSETS.challenge.taxonomyPillars}
                width={704}
              />
            </div>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
