import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { ProgramaFormadoresSection } from "./ProgramaFormadoresSection";
import { BootcampLeadForm } from "./BootcampLeadForm";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

const VALUE_KEYS = [
  "value1Title", "value1Body",
  "value2Title", "value2Body",
  "value3Title", "value3Body",
  "value4Title", "value4Body",
  "value5Title", "value5Body",
] as const;

const VENUE_MAP_HREF =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Ptge. de Mercader, 9 08008 Barcelona");

// Bootcamp Zero × APCE Catalunya (22/10/2026), es-only — see
// odd/tasks/bootcamp-zero-programa.md. /en/program and /ca/programa keep the
// pre-existing "La entrada" content (old agenda + embedded speakers list)
// completely unchanged.
const ProgramaBootcampSectionEs = async () => {
  const t = await getTranslations("programaPage.bootcamp");

  return (
    <section
      aria-label={t("headline")}
      className="section-block bg-green-50"
      id="bootcamp-formulario"
    >
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28.5rem)] lg:gap-14">
          <div className="max-w-[48rem]">
            <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
            <p className="figma-title-3 mt-3 text-green-500">{t("dateLine")}</p>

            <div className="mt-4 flex flex-col gap-1">
              <p className="figma-text-l-bold text-green-500">{t("venueLine1")}</p>
              <a
                className="figma-text-m w-fit text-green-500 underline underline-offset-2 hover:opacity-80"
                href={VENUE_MAP_HREF}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("venueLine2")}
              </a>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-[8px] border-2 border-dashed border-green-500/40 bg-white px-4 py-3.5">
              <Image
                alt="APCE, Associació de Promotors de Catalunya"
                className="h-10 w-auto shrink-0 sm:h-14"
                height={160}
                src={SITE_ASSETS.programa.bootcampZero.apceLogoGray}
                width={460}
              />
              <div className="flex flex-col gap-0.5">
                <p className="figma-text-m font-bold text-surface-bg">{t("apceBadgeLine1")}</p>
                <p className="text-sm text-grey-dark">{t("apceBadgeLine2")}</p>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <p className="figma-text-m text-surface-bg">{t("paragraph1")}</p>
              <p className="figma-text-m text-surface-bg">{t("paragraph2")}</p>
              <p className="figma-text-m font-bold text-green-500">{t("limitedSeats")}</p>
            </div>

            <ul className="mt-8 space-y-4">
              {[0, 1, 2, 3, 4].map((index) => (
                <li className="flex items-start gap-3" key={`value-${index}`}>
                  <span className="mt-1 text-[1.5rem] leading-none text-green-500">✓</span>
                  <div>
                    <p className="figma-text-m font-bold text-surface-bg">{t(VALUE_KEYS[index * 2])}</p>
                    <p className="figma-text-m text-surface-bg">{t(VALUE_KEYS[index * 2 + 1])}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-fit lg:sticky lg:top-20 lg:self-start">
            <div className="flex h-fit flex-col gap-6 rounded-[5px] bg-green-500 px-10 py-8 text-white">
              <h3 className="figma-title-3 font-bold text-white">{t("formTitle")}</h3>

              <div className="flex items-start gap-3 rounded-[6px] bg-white px-4 py-3.5 text-surface-bg">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-green-50"
                >
                  <svg
                    fill="none"
                    height="20"
                    stroke="#236f39"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <circle cx="9" cy="8" r="4" />
                    <path d="M2 21c0-3.9 3.1-7 7-7 1.4 0 2.7.4 3.8 1.1" />
                    <path d="M15 19l2 2 4-4" />
                  </svg>
                </span>
                <div className="space-y-0.5">
                  <p className="figma-text-m font-bold text-surface-bg">{t("approvalTitle")}</p>
                  <p className="text-sm leading-relaxed text-surface-bg/80">{t("approvalBody")}</p>
                </div>
              </div>

              <p className="figma-text-m text-white">{t("noCostLine")}</p>

              <BootcampLeadForm
                companyTypeLegend={t("companyTypeLegend")}
                companyTypeOptionMember={t("companyTypeMember")}
                companyTypeOptionNonMember={t("companyTypeNonMember")}
                errorMessage={t("formError")}
                fieldCompany={t("fieldCompany")}
                fieldEmail={t("fieldEmail")}
                fieldName={t("fieldName")}
                fieldRole={t("fieldRole")}
                lunchLegend={t("lunchLegend")}
                lunchOptionNo={t("lunchNo")}
                lunchOptionYes={t("lunchYes")}
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

// Pre-existing "La entrada" block — kept byte-for-byte for /en/program and
// /ca/programa. Do not change its content; the Bootcamp Zero campaign only
// touches the es locale (see odd/tasks/bootcamp-zero-programa.md).
const ProgramaBootcampSectionDefault = async () => {
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
    <section aria-labelledby="programa-bootcamp-title" className="section-block bg-green-50">
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28.5rem)] lg:gap-14">
          <div className="max-w-[48rem]">
            <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
            <h2 className="figma-title-2-bold mt-3 text-surface-bg" id="programa-bootcamp-title">{t("headline")}</h2>
            <p className="figma-title-3 mt-3 text-green-500">{t("dateLine")}</p>
            <p className="figma-text-l-bold mt-2 text-green-500">{t("venueLine1")}</p>
            <p className="figma-text-m text-green-500 underline">{t("venueLine2")}</p>

            <div className="mt-7 space-y-4">
              <p className="figma-text-m text-surface-bg">{t("paragraph1")}</p>
              <p className="figma-text-m text-surface-bg">{t("paragraph2")}</p>
              <p className="figma-text-m text-surface-bg">{t("paragraph3")}</p>
              <p className="figma-text-m font-bold text-green-500">{t("limitedSeats")}</p>
            </div>

            <ul className="mt-8 space-y-4">
              {[0, 1, 2, 3, 4].map((index) => (
                <li className="flex items-start gap-3" key={`value-${index}`}>
                  <span className="mt-1 text-[1.5rem] leading-none text-green-500">✓</span>
                  <div>
                    <p className="figma-text-m font-bold text-surface-bg">{t(VALUE_KEYS[index * 2])}</p>
                    <p className="figma-text-m text-surface-bg">{t(VALUE_KEYS[index * 2 + 1])}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 max-w-[48rem]">
              <h3 className="figma-title-3 text-surface-bg">{t("programLabel")}</h3>
              <ul className="mt-6 divide-y divide-grey-light/50">
                {agenda.map((item) => (
                  <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-3" key={`${item.time}-${item.title}`}>
                    <p className="figma-text-m font-bold text-green-500">{item.time}</p>
                    <div>
                      <p className="figma-text-m font-bold text-surface-bg">{item.title}</p>
                      {item.meta ? <p className="figma-text-m text-grey-dark">{item.meta}</p> : null}
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
            <div className="flex h-fit flex-col gap-8 rounded-[5px] bg-green-500 px-10 py-8 text-white">
              <div className="space-y-4">
                <div>
                  <h3 className="figma-title-3 font-bold text-white">{t("ctaCardHeadline")}</h3>
                  <p className="figma-text-l-bold mt-1 text-white">{t("ctaCardSubhead")}</p>
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

export const ProgramaBootcampSection = async () => {
  const locale = await getLocale();
  return locale === "es" ? <ProgramaBootcampSectionEs /> : <ProgramaBootcampSectionDefault />;
};
