import { getTranslations } from "next-intl/server";
import { ProgramaFormadoresSection } from "./ProgramaFormadoresSection";
import { BootcampLeadForm } from "./BootcampLeadForm";
import { SectionContainer } from "@/components/ui/SectionContainer";

const VALUE_KEYS = [
  "value1Title", "value1Body",
  "value2Title", "value2Body",
  "value3Title", "value3Body",
  "value4Title", "value4Body",
  "value5Title", "value5Body",
] as const;

export const ProgramaBootcampSection = async () => {
  const t = await getTranslations("programaPage.bootcamp");
  const agenda = [
    { time: t("agenda1Time"), title: t("agenda1Title"), meta: t("agenda1Meta") },
    { time: t("agenda2Time"), title: t("agenda2Title"), meta: t("agenda2Meta") },
    { time: t("agenda3Time"), title: t("agenda3Title"), meta: t("agenda3Meta") },
    { time: t("agenda4Time"), title: t("agenda4Title"), meta: t("agenda4Meta") },
    { time: t("agenda5Time"), title: t("agenda5Title"), meta: t("agenda5Meta") },
    { time: t("agenda6Time"), title: t("agenda6Title"), meta: t("agenda6Meta") },
    { time: t("agenda7Time"), title: t("agenda7Title"), meta: t("agenda7Meta") },
    { time: t("agenda8Time"), title: t("agenda8Title"), meta: t("agenda8Meta") },
    { time: t("agenda9Time"), title: t("agenda9Title"), meta: t("agenda9Meta") },
    { time: t("agenda10Time"), title: t("agenda10Title"), meta: t("agenda10Meta") },
    { time: t("agenda11Time"), title: t("agenda11Title"), meta: t("agenda11Meta") },
    { time: t("agenda12Time"), title: t("agenda12Title"), meta: t("agenda12Meta") },
  ];

  return (
    <section className="bg-green-50 py-16 md:py-20">
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28.5rem)] lg:gap-14">
          <div className="max-w-[48rem]">
            <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
            <h2 className="figma-title-2-bold mt-3 text-surface-bg">{t("headline")}</h2>
            <p className="mt-3 text-[1.75rem] leading-[1.2] text-green-500 sm:text-[2rem] md:text-[2.25rem]">{t("dateLine")}</p>
            <p className="figma-text-l-bold mt-2 text-green-500">{t("venueLine1")}</p>
            <p className="figma-text-m text-green-500 underline">{t("venueLine2")}</p>

            <div className="mt-7 space-y-4">
              <p className="figma-text-l text-surface-bg">{t("paragraph1")}</p>
              <p className="figma-text-l text-surface-bg">{t("paragraph2")}</p>
              <p className="figma-text-l text-surface-bg">{t("paragraph3")}</p>
              <p className="figma-text-l-bold text-green-500">{t("limitedSeats")}</p>
            </div>

            <ul className="mt-8 space-y-4">
              {[0, 1, 2, 3, 4].map((index) => (
                <li className="flex items-start gap-3" key={`value-${index}`}>
                  <span className="mt-1 text-[1.5rem] leading-none text-green-500">✓</span>
                  <div>
                    <p className="figma-text-l-bold text-surface-bg">{t(VALUE_KEYS[index * 2])}</p>
                    <p className="figma-text-l text-surface-bg">{t(VALUE_KEYS[index * 2 + 1])}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 max-w-[48rem]">
              <h3 className="figma-title-3 text-surface-bg">{t("programLabel")}</h3>
              <ul className="mt-6 divide-y divide-grey-light/50">
                {agenda.map((item) => (
                  <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-3" key={`${item.time}-${item.title}`}>
                    <p className="figma-text-l-bold text-green-500">{item.time}</p>
                    <div>
                      <p className="figma-text-l-bold text-surface-bg">{item.title}</p>
                      {item.meta ? <p className="figma-text-l text-grey-dark">{item.meta}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="max-w-[48rem]">
              <ProgramaFormadoresSection embedded />
            </div>
          </div>

          <div className="h-fit lg:sticky lg:top-20 lg:self-start">
            <div className="flex h-fit flex-col gap-[34px] rounded-[5px] bg-green-500 px-10 py-[30px] text-white">
              <div className="space-y-4">
                <div>
                  <h3 className="figma-title-3 font-bold text-white">{t("ctaCardHeadline")}</h3>
                  <p className="figma-text-l-bold mt-[5px] text-white">{t("ctaCardSubhead")}</p>
                </div>
                <p className="figma-text-m text-white">{t("ctaCardBody")}</p>
              </div>

              <BootcampLeadForm
                errorMessage={t("formError")}
                fieldCompany={t("fieldCompany")}
                fieldEmail={t("fieldEmail")}
                fieldName={t("fieldName")}
                fieldRole={t("fieldRole")}
                submitLabel={t("ctaCardCta")}
                successMessage={t("formSuccess")}
              />
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
