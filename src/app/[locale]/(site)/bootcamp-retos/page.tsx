import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { BootcampRetosForm } from "@/components/sections/bootcamp-retos/BootcampRetosForm";

type Props = { params: Promise<{ locale: string }> };

/**
 * Hidden landing reached only through the printed QR at the Bootcamp Zero event
 * (22/10/2026). Not linked from nav, footer or any page, not listed in
 * src/app/sitemap.ts (which uses an explicit allow-list) and marked noindex.
 * Spanish only — see odd/tasks/bootcamp-retos-landing.md.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bootcampRetosPage");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export default async function BootcampRetosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bootcampRetosPage");

  return (
    <section className="section-block bg-green-50">
      <SectionContainer>
        <div className="mx-auto max-w-[40rem]">
          <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
          <h1 className="figma-title-2-bold mt-3 text-surface-bg">{t("headline")}</h1>
          <p className="figma-text-m mt-4 text-surface-bg/70">{t("intro")}</p>

          <div className="mt-8">
            <BootcampRetosForm
              locale={locale}
              t={{
                challengesLegend: t("challengesLegend"),
                challenge1: t("challenge1"),
                challenge2: t("challenge2"),
                challenge3: t("challenge3"),
                challenge4: t("challenge4"),
                challenge5: t("challenge5"),
                challengeOther: t("challengeOther"),
                challengeOtherPlaceholder: t("challengeOtherPlaceholder"),
                fieldName: t("fieldName"),
                fieldNamePlaceholder: t("fieldNamePlaceholder"),
                fieldEmail: t("fieldEmail"),
                fieldEmailPlaceholder: t("fieldEmailPlaceholder"),
                fieldCompany: t("fieldCompany"),
                fieldCompanyPlaceholder: t("fieldCompanyPlaceholder"),
                contactLegend: t("contactLegend"),
                contactYes: t("contactYes"),
                contactNo: t("contactNo"),
                checkPrivacy: t("checkPrivacy"),
                checkPrivacyLink: t("checkPrivacyLink"),
                submit: t("submit"),
                submitting: t("submitting"),
                errorRequired: t("errorRequired"),
                errorEmail: t("errorEmail"),
                errorChallenges: t("errorChallenges"),
                errorOtherEmpty: t("errorOtherEmpty"),
                errorContact: t("errorContact"),
                errorPrivacy: t("errorPrivacy"),
                errorGeneric: t("errorGeneric"),
                errorConnection: t("errorConnection"),
                successTitle: t("successTitle"),
                successBody: t("successBody"),
              }}
            />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
