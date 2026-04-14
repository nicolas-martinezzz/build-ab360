import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS, SITE_SECTION_IDS } from "@/config/routes";

type AgentKey = "agent1" | "agent2" | "agent3";

const AGENTS: readonly { key: AgentKey; live: boolean }[] = [
  { key: "agent1", live: true },
  { key: "agent2", live: false },
  { key: "agent3", live: false },
];

const PILL_KEYS: Record<AgentKey, readonly string[]> = {
  agent1: ["agent1.pill1", "agent1.pill2", "agent1.pill3"],
  agent2: ["agent2.pill1", "agent2.pill2", "agent2.pill3"],
  agent3: ["agent3.pill1", "agent3.pill2"],
};

export const Ab360PlatformSection = async () => {
  const t = await getTranslations("home.ab360");

  return (
    <section
      aria-labelledby="ab360-title"
      className="section-block-spacious bg-white"
      id={SITE_SECTION_IDS.platform}
    >
      <SectionContainer>
        <header className="max-w-3xl">
          <p className="figma-text-l text-grey-dark">{t("label")}</p>
          <h2
            className="figma-title-2-bold mt-3 text-surface-bg [overflow-wrap:anywhere]"
            id="ab360-title"
          >
            <span className="block">{t("headlineLine1")}</span>
            <span className="mt-1 block">{t("headlineLine2")}</span>
          </h2>
          <p className="figma-text-l mt-6 text-grey-dark sm:mt-7">{t("body")}</p>
          <LinkButton
            className="mt-10 w-full min-h-12 sm:mt-12 sm:w-auto sm:min-w-[12rem]"
            href={SITE_PATHS.challenge}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </header>

        <ul className="mt-16 grid list-none grid-cols-1 gap-12 p-0 sm:mt-20 md:mt-24 md:grid-cols-3 md:gap-10 lg:gap-12">
          {AGENTS.map(({ key, live }) => (
            <li key={key} className="min-w-0">
              <article className="flex h-full flex-col">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={
                      live
                        ? "rounded-[0.3125rem] border border-green-600 px-2.5 py-0.5 text-base font-normal leading-[1.44] text-green-600"
                        : "rounded-[0.3125rem] border border-grey-light px-2.5 py-0.5 text-base font-normal leading-[1.44] text-grey-dark"
                    }
                  >
                    {t(`${key}.badge`)}
                  </span>
                </div>
                <p className="mt-3 text-base italic leading-6 text-black">{t(`${key}.role`)}</p>
                <h3 className="mt-2 text-2xl font-bold leading-[1.44] text-black">{t(`${key}.title`)}</h3>
                <p className="mt-3 flex-1 figma-text-m text-surface-bg">{t(`${key}.body`)}</p>
                <p className="mt-6 text-base font-normal leading-6 text-surface-bg">{t(`${key}.metricsLabel`)}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {PILL_KEYS[key].map((pillKey) => (
                    <li key={pillKey}>
                      <span className="inline-block rounded-[0.125rem] bg-green-100 px-[0.3125rem] py-0 text-sm font-normal leading-6 text-green-400">
                        {t(pillKey)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </section>
  );
};
