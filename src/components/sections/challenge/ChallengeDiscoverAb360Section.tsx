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
    <section className="bg-white py-14 md:py-[4.0625rem]">
      <SectionContainer>
        <p className="figma-text-l text-black">{t("eyebrow")}</p>
        <h2 className="figma-title-2-bold mt-5 max-w-[49.375rem] text-black">
          {t("headline")}
        </h2>
        <p className="figma-text-l-bold mt-10 max-w-[45.625rem] text-green-500">{t("highlight")}</p>
        <p className="figma-text-l mt-8 max-w-[45.625rem] text-black">{t("paragraph1")}</p>
        <p className="figma-text-l mt-0 max-w-[45.625rem] text-black">{t("paragraph2")}</p>

        <ul className="mt-[2.625rem] grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {DISCOVER_AGENT_CARDS.map((card) => (
            <li key={card.key} className="min-w-0">
              <article className="flex h-full flex-col gap-1.5 p-5">
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
                <p className="figma-text-m mt-1.5 text-surface-bg">{t("metricsLabel")}</p>
                <div className="mt-[3px] flex flex-wrap gap-[7px]">
                  {card.pills.map((pillKey) => (
                    <span className="rounded-[2px] bg-green-100 px-[5px] text-sm font-normal leading-6 text-green-400" key={pillKey}>
                      {t(pillKey)}
                    </span>
                  ))}
                </div>
                {card.key === "agent1" ? (
                  <LinkButton className="mt-4 w-fit" href={SITE_PATHS.contact} variant="primary">
                    {t("agent1Cta")}
                  </LinkButton>
                ) : null}
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-[0.9375rem] flex justify-center">
          <LinkButton href={SITE_PATHS.information} variant="outline">
            {t("finalCta")}
          </LinkButton>
        </div>
      </SectionContainer>
    </section>
  );
};
