import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalContentSection } from "@/components/sections/LegalContentSection";
import { SectionContainer } from "@/components/ui/SectionContainer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contactPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

type ContactPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getFirst = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { locale } = await params;
  const t = await getTranslations("contactPage");
  const rawMessages = (await import(`@/messages/${locale}.json`)).default as {
    contactPage?: Record<string, string>;
  };
  const contactLabels = rawMessages.contactPage ?? {};
  const query = await searchParams;
  const leadData = {
    name: getFirst(query.name),
    email: getFirst(query.email),
    role: getFirst(query.role),
    company: getFirst(query.company),
  };
  const hasLeadData = Object.values(leadData).some(Boolean);

  return (
    <>
      <LegalContentSection title={t("title")}>{t("body")}</LegalContentSection>
      {hasLeadData ? (
        <section className="bg-green-50 pb-16 pt-0 sm:pb-20 md:pb-24">
          <SectionContainer className="max-w-3xl">
            <div className="rounded-[10px] border border-green-500/20 bg-white p-6 text-surface-bg shadow-sm sm:p-8">
              <h2 className="figma-text-l-bold text-surface-bg">
                {contactLabels.leadSummaryTitle ?? t("leadSummaryTitle")}
              </h2>
              <p className="figma-text-m mt-3 text-grey-dark">
                {contactLabels.leadSummaryBody ?? t("leadSummaryBody")}
              </p>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="figma-text-m font-semibold text-surface-bg">{contactLabels.fieldName ?? t("fieldName")}</dt>
                  <dd className="figma-text-m text-grey-dark">{leadData.name || "—"}</dd>
                </div>
                <div>
                  <dt className="figma-text-m font-semibold text-surface-bg">{contactLabels.fieldEmail ?? t("fieldEmail")}</dt>
                  <dd className="figma-text-m text-grey-dark">{leadData.email || "—"}</dd>
                </div>
                <div>
                  <dt className="figma-text-m font-semibold text-surface-bg">{contactLabels.fieldRole ?? t("fieldRole")}</dt>
                  <dd className="figma-text-m text-grey-dark">{leadData.role || "—"}</dd>
                </div>
                <div>
                  <dt className="figma-text-m font-semibold text-surface-bg">{contactLabels.fieldCompany ?? t("fieldCompany")}</dt>
                  <dd className="figma-text-m text-grey-dark">{leadData.company || "—"}</dd>
                </div>
              </dl>
            </div>
          </SectionContainer>
        </section>
      ) : null}
    </>
  );
}
