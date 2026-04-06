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
      className="bg-white py-16 sm:py-20 md:py-28"
      id={SITE_SECTION_IDS.platform}
    >
      <SectionContainer>
        <header className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wide text-grey-dark sm:text-sm">{t("label")}</p>
          <h2
            className="mt-3 text-2xl font-bold text-surface-bg [overflow-wrap:anywhere] sm:text-3xl md:text-4xl"
            id="ab360-title"
          >
            <span className="block">{t("headlineLine1")}</span>
            <span className="mt-1 block">{t("headlineLine2")}</span>
          </h2>
          <p className="mt-5 text-base text-grey-dark leading-relaxed sm:mt-6 sm:text-lg">{t("body")}</p>
          <LinkButton
            className="mt-8 w-full min-h-12 sm:mt-10 sm:w-auto sm:min-w-[12rem]"
            href={SITE_PATHS.challenge}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </header>

        <ul className="mt-14 grid list-none grid-cols-1 gap-12 p-0 sm:mt-16 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-10">
          {AGENTS.map(({ key, live }) => (
            <li key={key} className="min-w-0">
              <article className="flex h-full flex-col">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={
                      live
                        ? "rounded-full border border-green-600 px-2.5 py-0.5 text-xs font-semibold text-green-600"
                        : "rounded-full border border-grey-light px-2.5 py-0.5 text-xs font-medium text-grey-dark"
                    }
                  >
                    {t(`${key}.badge`)}
                  </span>
                </div>
                <p className="mt-3 text-sm italic text-grey-dark">{t(`${key}.role`)}</p>
                <h3 className="mt-2 text-xl font-bold text-surface-bg">{t(`${key}.title`)}</h3>
                <p className="mt-3 flex-1 text-sm text-grey-dark leading-relaxed sm:text-base">{t(`${key}.body`)}</p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-grey-dark">{t(`${key}.metricsLabel`)}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {PILL_KEYS[key].map((pillKey) => (
                    <li key={pillKey}>
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
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
