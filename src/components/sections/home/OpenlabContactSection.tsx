import { getLocale, getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_SECTION_IDS } from "@/config/routes";
import { OpenlabContactForm } from "./OpenlabContactForm";

export const OpenlabContactSection = async () => {
  const [t, locale] = await Promise.all([
    getTranslations("home.openlab.contactForm"),
    getLocale(),
  ]);

  const formTranslations = {
    fieldName: t("fieldName"),
    fieldNamePlaceholder: t("fieldNamePlaceholder"),
    fieldEmail: t("fieldEmail"),
    fieldEmailPlaceholder: t("fieldEmailPlaceholder"),
    fieldOrg: t("fieldOrg"),
    fieldOrgPlaceholder: t("fieldOrgPlaceholder"),
    fieldPriority: t("fieldPriority"),
    fieldPriorityPlaceholder: t("fieldPriorityPlaceholder"),
    priorityOpt1: t("priorityOpt1"),
    priorityOpt2: t("priorityOpt2"),
    priorityOpt3: t("priorityOpt3"),
    priorityOpt4: t("priorityOpt4"),
    fieldMessage: t("fieldMessage"),
    fieldMessagePlaceholder: t("fieldMessagePlaceholder"),
    checkPrivacy: t("checkPrivacy"),
    checkPrivacyLink: t("checkPrivacyLink"),
    checkNewsletter: t("checkNewsletter"),
    submit: t("submit"),
    submitting: t("submitting"),
    errorRequired: t("errorRequired"),
    errorEmail: t("errorEmail"),
    errorPrivacy: t("errorPrivacy"),
    errorGeneric: t("errorGeneric"),
    errorConnection: t("errorConnection"),
    successTitle: t("successTitle"),
    successBody: t("successBody"),
  };

  return (
    <section
      aria-labelledby="openlab-contact-title"
      className="section-block bg-surface-light"
      id={SITE_SECTION_IDS.openlabContact}
    >
      <SectionContainer>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_28rem] lg:items-start lg:gap-16">

          {/* Left — copy */}
          <div>
            <p className="type-eyebrow text-surface-bg/50">{t("eyebrow")}</p>
            <h2
              className="figma-title-2-bold mt-4 text-surface-bg [overflow-wrap:anywhere]"
              id="openlab-contact-title"
            >
              {t("headline")}
            </h2>
            <p className="figma-text-l mt-5 leading-relaxed text-surface-bg/70">
              {t("description")}
            </p>
          </div>

          {/* Right — form card */}
          <div className="rounded-[10px] border border-surface-bg/10 bg-white p-6 shadow-[var(--shadow-panel-lg)] sm:p-8">
            <OpenlabContactForm locale={locale} t={formTranslations} />
          </div>

        </div>
      </SectionContainer>
    </section>
  );
};
