import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { BootcampRetosForm } from "@/components/sections/bootcamp-retos/BootcampRetosForm";
import {
  CHALLENGE_KEYS,
  type ChallengeCopy,
  type ChallengeKey,
} from "@/components/sections/bootcamp-retos/challenges";

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

  // Each challenge carries three lines of copy (title, the problem, what the
  // visitor would like to achieve), so it is resolved here by key rather than
  // passed as a long flat list of props.
  const challenges = Object.fromEntries(
    CHALLENGE_KEYS.map((key) => [
      key,
      {
        title: t(`challenges.${key}.title`),
        problem: t(`challenges.${key}.problem`),
        want: t(`challenges.${key}.want`),
      },
    ]),
  ) as Record<ChallengeKey, ChallengeCopy>;

  return (
    <section className="section-block bg-surface-light">
      <SectionContainer>
        <div className="mx-auto max-w-[40rem]">
          <BootcampRetosForm
            challenges={challenges}
            header={
              <>
                <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
                <h1 className="figma-title-2-bold mt-3 text-surface-bg">
                  {t("headline")}
                </h1>
                <p className="figma-text-m mt-3 text-surface-bg/70">{t("intro")}</p>
              </>
            }
            locale={locale}
            other={{
              title: t("challenges.other.title"),
              problem: t("challenges.other.problem"),
            }}
            t={{
              challengesLegend: t("challengesLegend"),
              wantLabel: t("wantLabel"),
              challengeOtherLabel: t("challengeOtherLabel"),
              challengeOtherPlaceholder: t("challengeOtherPlaceholder"),
              contactCheck: t("contactCheck"),
              contactIntro: t("contactIntro"),
              fieldName: t("fieldName"),
              fieldNamePlaceholder: t("fieldNamePlaceholder"),
              fieldCompany: t("fieldCompany"),
              fieldCompanyPlaceholder: t("fieldCompanyPlaceholder"),
              fieldEmail: t("fieldEmail"),
              fieldEmailPlaceholder: t("fieldEmailPlaceholder"),
              checkPrivacy: t("checkPrivacy"),
              checkPrivacyLink: t("checkPrivacyLink"),
              submit: t("submit"),
              submitting: t("submitting"),
              errorChallenges: t("errorChallenges"),
              errorOtherEmpty: t("errorOtherEmpty"),
              errorMissingPrefix: t("errorMissingPrefix"),
              errorMissingName: t("errorMissingName"),
              errorMissingCompany: t("errorMissingCompany"),
              errorMissingEmail: t("errorMissingEmail"),
              errorEmail: t("errorEmail"),
              errorPrivacy: t("errorPrivacy"),
              errorGeneric: t("errorGeneric"),
              errorConnection: t("errorConnection"),
              successTitle: t("successTitle"),
              successBodyContact: t("successBodyContact"),
              successBodyNoContact: t("successBodyNoContact"),
              successBack: t("successBack"),
            }}
        />
        </div>
      </SectionContainer>
    </section>
  );
}
