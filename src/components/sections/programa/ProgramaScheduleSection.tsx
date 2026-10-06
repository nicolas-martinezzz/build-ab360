import { type ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const boldChunk = (chunks: ReactNode) => <b className="text-surface-bg">{chunks}</b>;

type ScheduleRowProps = {
  time: string;
  title: string;
  children: ReactNode;
};

const ScheduleRow = ({ time, title, children }: ScheduleRowProps) => (
  <li className="flex flex-col gap-3 border-t border-grey-light/60 py-6 sm:flex-row sm:gap-8">
    <p className="figma-text-l-bold w-[5.5rem] shrink-0 text-green-500">{time}</p>
    <div className="flex flex-col gap-2">
      <p className="figma-title-3 text-surface-bg">{title}</p>
      {children}
    </div>
  </li>
);

// Bootcamp Zero × APCE Catalunya (22/10/2026), es-only — see
// odd/tasks/bootcamp-zero-programa.md. Replaces the old agenda that used to
// live inline inside ProgramaBootcampSection; there is no en/ca equivalent
// because this section is never rendered for those locales.
export const ProgramaScheduleSection = async () => {
  const t = await getTranslations("programaPage.schedule");

  return (
    <section aria-label={t("headline")} className="section-block bg-green-50">
      <SectionContainer>
        <h2 className="figma-title-2-bold text-surface-bg">{t("headline")}</h2>

        <ul className="mt-6">
          <ScheduleRow time={t("item1Time")} title={t("item1Title")}>
            <p className="figma-text-m text-grey-dark">
              {t.rich("item1Body", { b: boldChunk })}
            </p>
          </ScheduleRow>

          <ScheduleRow time={t("item2Time")} title={t("item2Title")}>
            <p className="type-eyebrow text-grey-dark">{t("item2PanelistsLabel")}</p>
            <p className="figma-text-m text-grey-dark">
              {t.rich("item2PanelistsBody", { b: boldChunk })}
            </p>
            <p className="type-eyebrow mt-2 text-grey-dark">{t("item2ModeratorLabel")}</p>
            <p className="figma-text-m text-grey-dark">
              {t.rich("item2ModeratorBody", { b: boldChunk })}
            </p>
          </ScheduleRow>

          <ScheduleRow time={t("item3Time")} title={t("item3Title")}>
            <p className="figma-text-m text-grey-dark">{t("item3Intro")}</p>
            <ul className="space-y-1">
              <li className="figma-text-m text-grey-dark">
                · {t.rich("item3Bullet1", { b: boldChunk })}
              </li>
              <li className="figma-text-m text-grey-dark">
                · {t.rich("item3Bullet2", { b: boldChunk })}
              </li>
              <li className="figma-text-m text-grey-dark">
                · {t.rich("item3Bullet3", { b: boldChunk })}
              </li>
            </ul>
            <p className="figma-text-m text-grey-dark">
              {t.rich("item3Team", { b: boldChunk })}
            </p>
          </ScheduleRow>

          <ScheduleRow time={t("item4Time")} title={t("item4Title")}>
            {null}
          </ScheduleRow>
        </ul>
      </SectionContainer>
    </section>
  );
};
