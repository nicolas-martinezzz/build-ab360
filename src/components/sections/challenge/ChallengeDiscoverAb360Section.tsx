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
    <section aria-labelledby="challenge-discover-title" className="section-block bg-white">
      <SectionContainer>
        <div className="max-w-[50rem]">
          <p className="type-eyebrow text-black">{t("eyebrow")}</p>
          <h2 className="figma-title-2-bold mt-4 text-black" id="challenge-discover-title">
            {t("headline")}
          </h2>
          <p className="figma-text-l-bold mt-8 text-green-500">{t("highlight")}</p>
          <p className="figma-text-l mt-5 max-w-[45.625rem] text-black">{t("paragraph1")}</p>
          <p className="figma-text-l mt-4 max-w-[45.625rem] text-black">{t("paragraph2")}</p>

          <div className="mt-6 flex flex-col items-start">
            <LinkButton className="w-full max-w-sm border-green-500 px-5 text-green-500 hover:bg-green-100/50 sm:w-auto" href={SITE_PATHS.solution} variant="outline">
              {t("sectionCta")}
            </LinkButton>
            <p className="figma-text-m mt-3 italic text-grey-dark">{t("sectionCtaHint")}</p>
          </div>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {DISCOVER_AGENT_CARDS.map((card) => (
            <li key={card.key} className="min-w-0">
              <article className="flex h-full flex-col gap-1 rounded-[5px] border border-grey-light p-4">
                <span
                  className={
                    card.isLive
                      ? "inline-flex w-fit rounded-[5px] border border-green-500 bg-white px-2.5 py-[3px] figma-text-m text-green-500"
                      : "inline-flex w-fit rounded-[5px] border border-grey-light bg-white px-2.5 py-[3px] figma-text-m text-grey-dark"
                  }
                >
                  {t(`${card.key}.badge`)}
                </span>
                <p className="figma-text-m italic text-black">{t(`${card.key}.role`)}</p>
                <h3 className="figma-text-l-bold text-black">{t(`${card.key}.title`)}</h3>
                <p className="figma-text-m text-surface-bg">{t(`${card.key}.body`)}</p>
                <p className="figma-text-m mt-auto pt-1 text-surface-bg">{t("metricsLabel")}</p>
                <div className="mt-[3px] flex flex-wrap gap-[7px]">
                  {card.pills.map((pillKey) => (
                    <span className="rounded-[2px] bg-green-100 px-[5px] figma-text-m leading-6 text-green-400" key={pillKey}>
                      {t(pillKey)}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </section>
  );
};
