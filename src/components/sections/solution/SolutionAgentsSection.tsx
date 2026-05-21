import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

type AgentCardProps = {
  status: "live" | "development";
  statusLabel: string;
  role: string;
  title: string;
  shortDesc: string;
  languageLabel: string;
  pills: string[];
  imageSrc: string;
  description: string;
  descriptionLine2?: string;
  features: string[];
  checkIcon: string;
};

const AgentCard = ({
  status,
  statusLabel,
  role,
  title,
  shortDesc,
  languageLabel,
  pills,
  imageSrc,
  description,
  descriptionLine2,
  features,
  checkIcon,
}: AgentCardProps) => {
  const badgeClasses =
    status === "live"
      ? "border-green-500 text-green-500"
      : "border-grey-light text-grey-dark";

  return (
    <article className="relative isolate flex flex-col gap-6 py-8 lg:flex-row">
      <div className="flex w-full flex-col gap-2 lg:w-[22.75rem] lg:shrink-0">
        <span
          className={`w-fit rounded-[5px] border bg-white px-2 py-[2px] text-sm leading-[1.2] ${badgeClasses}`}
        >
          {statusLabel}
        </span>

        <div className="flex flex-col gap-1">
          <p className="figma-text-l italic text-surface-bg">{role}</p>
          <h3 className="figma-title-3 text-surface-bg">{title}</h3>
          <p className="figma-text-l text-surface-bg">{shortDesc}</p>
        </div>

        <div className="mt-2 flex flex-col gap-1.5">
          <p className="figma-text-l text-grey-dark">{languageLabel}</p>
          <div className="flex flex-wrap gap-[7px]">
            {pills.map((pill, pillIndex) => (
              <span
                key={`${title}-pill-${pillIndex}-${pill}`}
                className="rounded-[2px] bg-green-100 px-[8px] py-[2px] text-sm leading-[1.2] text-green-400"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[30px]">
        <div className="relative aspect-[2752/1536] min-h-[10rem] w-full overflow-hidden bg-green-100 sm:min-h-[13rem] md:min-h-[18rem]">
          <Image
            alt={title}
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 683px"
            src={imageSrc}
          />
        </div>

        <div className="flex flex-col gap-4">
          <p className="figma-text-l text-surface-bg">{description}</p>
          {descriptionLine2 ? (
            <p className="figma-text-l text-surface-bg">{descriptionLine2}</p>
          ) : null}

          <ul className="flex flex-col gap-3">
            {features.map((feature, featureIndex) => (
              <li
                key={`${title}-feature-${featureIndex}`}
                className="flex items-start gap-4"
              >
                <Image
                  alt=""
                  aria-hidden
                  className="shrink-0"
                  height={24}
                  src={checkIcon}
                  width={24}
                />
                <span className="figma-text-l flex-1 text-surface-bg">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
};

export const SolutionAgentsSection = async () => {
  const t = await getTranslations("solutionPage.agents");

  return (
    <section aria-labelledby="solution-agents-title" className="section-block-spacious bg-agent-surface">
      <SectionContainer>
        <h2 className="figma-title-2 max-w-[53.5rem] text-surface-bg" id="solution-agents-title">
          {t("headline")}
        </h2>

        <div className="mt-10 divide-y divide-agent-divider">
          <AgentCard
            checkIcon={SITE_ASSETS.solution.checkIcon}
            description={t("agent1.description")}
            features={[
              t("agent1.feature1"),
              t("agent1.feature2"),
              t("agent1.feature3"),
              t("agent1.feature4"),
            ]}
            imageSrc={SITE_ASSETS.solution.simulabAgent}
            languageLabel={t("agent1.languageLabel")}
            pills={[t("agent1.pill1"), t("agent1.pill2"), t("agent1.pill3")]}
            role={t("agent1.role")}
            shortDesc={t("agent1.shortDesc")}
            status="live"
            statusLabel={t("agent1.badge")}
            title={t("agent1.title")}
          />

          <AgentCard
            checkIcon={SITE_ASSETS.solution.checkIcon}
            description={t("agent2.description")}
            descriptionLine2={t("agent2.descriptionLine2")}
            features={[
              t("agent2.feature1"),
              t("agent2.feature2"),
              t("agent2.feature3"),
              t("agent2.feature4"),
            ]}
            imageSrc={SITE_ASSETS.solution.cyclePlannerAgent}
            languageLabel={t("agent2.languageLabel")}
            pills={[t("agent2.pill1"), t("agent2.pill2"), t("agent2.pill3")]}
            role={t("agent2.role")}
            shortDesc={t("agent2.shortDesc")}
            status="development"
            statusLabel={t("agent2.badge")}
            title={t("agent2.title")}
          />

          <AgentCard
            checkIcon={SITE_ASSETS.solution.checkIcon}
            description={t("agent3.description")}
            features={[t("agent3.feature1"), t("agent3.feature2"), t("agent3.feature3")]}
            imageSrc={SITE_ASSETS.solution.platonAgent}
            languageLabel={t("agent3.languageLabel")}
            pills={[t("agent3.pill1"), t("agent3.pill2")]}
            role={t("agent3.role")}
            shortDesc={t("agent3.shortDesc")}
            status="development"
            statusLabel={t("agent3.badge")}
            title={t("agent3.title")}
          />
        </div>
      </SectionContainer>
    </section>
  );
};
