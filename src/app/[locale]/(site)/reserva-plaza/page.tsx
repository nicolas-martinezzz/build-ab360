import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ReservaPlazaForm } from "@/components/reserva-plaza/ReservaPlazaForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reservaPlazaPage.metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export default async function ReservaPlazaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reservaPlazaPage");

  const steps = [
    { n: "01", title: t("steps.step1Title"), body: t("steps.step1Body") },
    { n: "02", title: t("steps.step2Title"), body: t("steps.step2Body") },
    { n: "03", title: t("steps.step3Title"), body: t("steps.step3Body") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="section-block bg-surface-bg">
        <SectionContainer>
          <div className="max-w-2xl">
            <p className="type-eyebrow text-green-400">{t("hero.eyebrow")}</p>
            <h1 className="figma-title-1 mt-3 text-white">
              {t("hero.title")}
            </h1>
            <p className="figma-text-l mt-4 text-white/70">
              {t("hero.body")}
            </p>
          </div>
        </SectionContainer>
      </section>

      {/* Form + steps */}
      <section className="section-block bg-surface-light">
        <SectionContainer>
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_26.25rem] lg:items-start lg:gap-16">

            {/* Steps — left */}
            <div>
              <p className="type-eyebrow text-surface-bg/50">{t("steps.eyebrow")}</p>
              <h2 className="figma-title-3 mt-3 text-surface-bg">
                {t("steps.title")}
              </h2>
              <p className="figma-text-m mt-3 text-surface-bg/60">
                {t("steps.body")}
              </p>
              <ol className="mt-8 flex flex-col gap-4">
                {steps.map(({ n, title, body }) => (
                  <li key={n} className="flex gap-4 rounded-[10px] border border-surface-bg/10 bg-white px-5 py-4 shadow-[var(--shadow-panel)]">
                    <span className="figma-text-l-bold shrink-0 w-7 text-green-600">{n}.</span>
                    <div>
                      <p className="figma-text-m font-bold text-surface-bg">{title}</p>
                      <p className="figma-text-m mt-0.5 text-surface-bg/60">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Form — right */}
            <div className="rounded-[10px] border border-surface-bg/10 bg-white p-6 shadow-[var(--shadow-panel-lg)] sm:p-8 lg:sticky lg:top-24">
              <p className="type-eyebrow text-surface-bg/40">{t("form.stepLabel")}</p>
              <h3 className="figma-title-3 mt-2 text-surface-bg">
                {t("form.stepTitle")}
              </h3>
              <ReservaPlazaForm locale={locale} />
            </div>

          </div>
        </SectionContainer>
      </section>
    </>
  );
}
