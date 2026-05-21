import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS } from "@/config/routes";

type Pill = { key: string; label: string };

type JourneyCardProps = {
  token: string;
  title: string;
  body: string;
  pills: Pill[];
};

const JourneyCard = ({ token, title, body, pills }: JourneyCardProps) => (
  <article className="overflow-hidden rounded-[8px] border border-grey-light bg-white">
    <div className="grid grid-cols-[5.2rem_1fr]">
      <div className="relative flex items-start justify-center bg-surface-bg p-4">
        <div className="absolute right-0 top-0 h-full w-[3px] bg-green-500" />
        <span className="text-[2rem] font-bold leading-none text-white">{token}</span>
      </div>

      <div className="p-5 md:p-6">
        <h3 className="figma-text-l-bold text-surface-bg">{title}</h3>
        <p className="figma-text-l mt-2 text-grey-dark">{body}</p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {pills.map((pill) => (
            <li
              className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm leading-none text-green-500"
              key={pill.key}
            >
              <span className="inline-block size-[10px] rounded-[2px] border border-green-500/60" />
              {pill.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </article>
);

export const ProgramaJourneySection = async () => {
  const t = await getTranslations("programaPage.journey");

  return (
    <section aria-labelledby="programa-journey-title" className="section-block-spacious bg-journey-surface">
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
            <h2 className="figma-title-2-bold mt-3 text-surface-bg" id="programa-journey-title">{t("headline")}</h2>
            <p className="figma-text-l mt-6 text-surface-bg">{t("introLead")}</p>
            <p className="figma-text-m mt-6 text-grey-dark">{t("introBody")}</p>
            <p className="figma-text-m mt-5 text-surface-bg">{t("introFoot")}</p>

            <LinkButton
              className="mt-7 border-green-500 px-4"
              href={SITE_PATHS.reservaPlaza}
              variant="outline"
            >
              {t("cta")}
            </LinkButton>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="figma-card-title text-surface-bg">{t("block1Title")}</h3>
              <div className="space-y-4">
                <JourneyCard
                  body={t("t1Body")}
                  pills={[
                    { key: "t1p1", label: t("t1Pill1") },
                    { key: "t1p2", label: t("t1Pill2") },
                  ]}
                  title={t("t1Title")}
                  token="T1"
                />
                <JourneyCard
                  body={t("t2Body")}
                  pills={[
                    { key: "t2p1", label: t("t2Pill1") },
                    { key: "t2p2", label: t("t2Pill2") },
                  ]}
                  title={t("t2Title")}
                  token="T2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="figma-card-title text-surface-bg">{t("block2Title")}</h3>
              <div className="space-y-4">
                <JourneyCard
                  body={t("t3Body")}
                  pills={[
                    { key: "t3p1", label: t("t3Pill1") },
                    { key: "t3p2", label: t("t3Pill2") },
                  ]}
                  title={t("t3Title")}
                  token="T3"
                />
                <JourneyCard
                  body={t("t4Body")}
                  pills={[
                    { key: "t4p1", label: t("t4Pill1") },
                    { key: "t4p2", label: t("t4Pill2") },
                  ]}
                  title={t("t4Title")}
                  token="T4"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="figma-card-title text-surface-bg">{t("block3Title")}</h3>
              <div className="space-y-4">
                <JourneyCard
                  body={t("t5Body")}
                  pills={[
                    { key: "t5p1", label: t("t5Pill1") },
                    { key: "t5p2", label: t("t5Pill2") },
                  ]}
                  title={t("t5Title")}
                  token="T5"
                />
                <JourneyCard
                  body={t("t6Body")}
                  pills={[{ key: "t6p1", label: t("t6Pill1") }]}
                  title={t("t6Title")}
                  token="T6"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
