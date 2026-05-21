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
            className="figma-title-2-bold mt-4 text-surface-bg [overflow-wrap:anywhere]"
            id="ab360-title"
          >
            <span className="block">{t("headlineLine1")}</span>
            <span className="mt-1 block">{t("headlineLine2")}</span>
          </h2>
          <p className="figma-text-l mt-2 text-grey-dark">{t("body")}</p>
          <LinkButton
            className="mt-3 w-full max-w-sm sm:w-auto"
            href={SITE_PATHS.challenge}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </header>

        <ul className="mt-10 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
          {AGENTS.map(({ key, live }) => (
            <li key={key} className="min-w-0">
              <article className="flex h-full flex-col gap-1.5 p-5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={
                      live
                        ? "rounded-[5px] border border-green-500 bg-white px-2.5 py-[3px] figma-text-m text-green-500"
                        : "rounded-[5px] border border-grey-light bg-white px-2.5 py-[3px] figma-text-m text-grey-dark"
                    }
                  >
                    {t(`${key}.badge`)}
                  </span>
                </div>
                <p className="figma-text-m italic text-black md:min-h-[3rem]">{t(`${key}.role`)}</p>
                <h3 className="figma-card-title text-black md:min-h-[3.5rem]">{t(`${key}.title`)}</h3>
                <p className="figma-text-m text-surface-bg md:min-h-[6rem]">{t(`${key}.body`)}</p>
                <p className="figma-text-m mt-auto pt-1.5 text-surface-bg">{t(`${key}.metricsLabel`)}</p>
                <ul className="mt-[3px] flex flex-wrap gap-[7px]">
                  {PILL_KEYS[key].map((pillKey) => (
                    <li key={pillKey}>
                      <span className="inline-block rounded-[2px] bg-green-100 px-[5px] text-sm font-normal leading-6 text-green-400">
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
