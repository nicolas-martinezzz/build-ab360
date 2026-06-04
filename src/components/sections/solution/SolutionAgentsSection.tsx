import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

type AgentCardProps = {
  status: "live" | "development";
  statusLabel: string;
  role: string;
  title: string;
  shortDesc: string;
  languageLabel: string;
  pills: string[];
  description: string;
  descriptionLine2?: string;
  features: string[];
};

const CheckIcon = () => (
  <svg className="mt-0.5 shrink-0 text-green-500" fill="none" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.75 9.75L7.5 13.5L14.25 5.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const AgentCard = ({
  status,
  statusLabel,
  role,
  title,
  shortDesc,
  languageLabel,
  pills,
  description,
  descriptionLine2,
  features,
}: AgentCardProps) => {
  const badgeClasses =
    status === "live"
      ? "border-green-500 text-green-500"
      : "border-grey-light text-grey-dark";

  return (
    <article className="grid gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-12">
      {/* Left */}
      <div className="flex flex-col gap-4">
        <span className={`w-fit rounded-[5px] border bg-white px-2 py-0.5 text-sm leading-[1.2] ${badgeClasses}`}>
          {statusLabel}
        </span>

        <div className="flex flex-col gap-1">
          <p className="figma-text-l italic text-surface-bg">{role}</p>
          <h3 className="figma-title-3 text-surface-bg">{title}</h3>
          <p className="figma-text-l mt-1 text-surface-bg">{shortDesc}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="figma-text-m text-grey-dark">{languageLabel}</p>
          <div className="flex flex-wrap gap-2">
            {pills.map((pill, i) => (
              <span key={i} className="rounded-[2px] bg-green-100 px-2 py-0.5 text-sm leading-[1.2] text-green-400">
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col gap-5">
        <p className="figma-text-l text-surface-bg">{description}</p>
        {descriptionLine2 ? <p className="figma-text-l text-surface-bg">{descriptionLine2}</p> : null}
        <ul className="flex flex-col gap-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckIcon />
              <span className="figma-text-l text-surface-bg">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};

export const SolutionAgentsSection = async () => {
  const t = await getTranslations("solutionPage.agents");

  return (
    <section aria-labelledby="solution-agents-title" className="section-block-spacious bg-agent-surface pt-10 pb-14 lg:pt-12 lg:pb-16">
      <SectionContainer>
        <h2 className="figma-title-2 max-w-[53.5rem] text-surface-bg" id="solution-agents-title">
          {t("headline")}
        </h2>

        <div className="mt-10 divide-y divide-agent-divider">
          <AgentCard
            description={t("agent2.description")}
            descriptionLine2={t("agent2.descriptionLine2")}
            features={[t("agent2.feature1"), t("agent2.feature2"), t("agent2.feature3"), t("agent2.feature4")]}
            languageLabel={t("agent2.languageLabel")}
            pills={[t("agent2.pill1"), t("agent2.pill2"), t("agent2.pill3")]}
            role={t("agent2.role")}
            shortDesc={t("agent2.shortDesc")}
            status="development"
            statusLabel={t("agent2.badge")}
            title={t("agent2.title")}
          />

          <AgentCard
            description={t("agent3.description")}
            features={[t("agent3.feature1"), t("agent3.feature2"), t("agent3.feature3")]}
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
