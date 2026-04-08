import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS } from "@/config/routes";

const DISCOVER_AGENT_CARDS = [
  {
    key: "agent1",
    isLive: true,
    pills: ["agent1.pill1", "agent1.pill2", "agent1.pill3"],
  },
  {
    key: "agent2",
    isLive: false,
    pills: ["agent2.pill1", "agent2.pill2", "agent2.pill3"],
  },
  {
    key: "agent3",
    isLive: false,
    pills: ["agent3.pill1", "agent3.pill2"],
  },
] as const;

export const ChallengeDiscoverAb360Section = async () => {
  const t = await getTranslations("challengePage.discoverAb360");

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24">
      <SectionContainer>
        <p className="text-sm font-medium uppercase tracking-wide text-grey-dark">{t("eyebrow")}</p>
        <h2 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-surface-bg sm:text-4xl md:text-5xl">
          {t("headline")}
        </h2>
        <p className="mt-4 max-w-3xl text-xl font-semibold leading-snug text-green-500 sm:text-2xl">{t("highlight")}</p>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-surface-bg/80 sm:text-lg">{t("paragraph1")}</p>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-surface-bg/80 sm:text-lg">{t("paragraph2")}</p>

        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {DISCOVER_AGENT_CARDS.map((card) => (
            <li key={card.key} className="min-w-0">
              <article className="flex h-full flex-col">
                <span
                  className={
                    card.isLive
                      ? "inline-flex w-fit rounded-[0.375rem] border border-green-500 px-2.5 py-0.5 text-xs font-semibold text-green-500"
                      : "inline-flex w-fit rounded-[0.375rem] border border-grey-light px-2.5 py-0.5 text-xs font-medium text-grey-dark"
                  }
                >
                  {t(`${card.key}.badge`)}
                </span>
                <p className="mt-3 text-sm italic text-grey-dark">{t(`${card.key}.role`)}</p>
                <h3 className="mt-2 text-3xl font-bold leading-tight text-surface-bg">{t(`${card.key}.title`)}</h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-surface-bg/80">{t(`${card.key}.body`)}</p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-grey-dark">{t("metricsLabel")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {card.pills.map((pillKey) => (
                    <span className="rounded-[0.25rem] bg-green-100 px-2 py-1 text-xs font-medium text-green-600" key={pillKey}>
                      {t(pillKey)}
                    </span>
                  ))}
                </div>
                {card.key === "agent1" ? (
                  <LinkButton className="mt-6 w-fit min-h-12 px-6" href={SITE_PATHS.contact} variant="primary">
                    {t("agent1Cta")}
                  </LinkButton>
                ) : null}
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <LinkButton className="min-h-12 min-w-[12rem] px-8" href={SITE_PATHS.information} variant="outline">
            {t("finalCta")}
          </LinkButton>
        </div>
      </SectionContainer>
    </section>
  );
};
