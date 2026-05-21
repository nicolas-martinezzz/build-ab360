import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ReservaPlazaForm } from "@/components/reserva-plaza/ReservaPlazaForm";

export const metadata: Metadata = {
  title: "Reserva tu plaza — Bootcamp Zero",
  description: "Solicita tu plaza en el Bootcamp Zero. Plazas limitadas, proceso de selección real.",
};

export default async function ReservaPlazaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const steps = [
    { n: "01", title: "Reservá tu plaza",    body: "Dejanos tus datos y te reservamos el lugar." },
    { n: "02", title: "Hacé el diagnóstico", body: "Completás el autodiagnóstico de tu empresa en 10 minutos." },
    { n: "03", title: "Te confirmamos",       body: "Revisamos tu perfil y te contactamos para confirmar." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-surface-bg py-16 md:py-20">
        <SectionContainer>
          <div className="max-w-2xl">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-green-400">
              Bootcamp Zero
            </p>
            <h1 className="mt-3 text-[1.75rem] font-bold leading-[1.15] text-white sm:text-[2.25rem] md:text-[2.75rem]">
              Únete al Bootcamp Zero
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Plazas limitadas · Selección real. Reservá tu plaza y completá el diagnóstico — analizamos tu perfil y te confirmamos si encajás con el programa.
            </p>
          </div>
        </SectionContainer>
      </section>

      {/* Form + steps */}
      <section className="bg-surface-light py-14 md:py-20">
        <SectionContainer>
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-16">

            {/* Steps — left */}
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-surface-bg/50">
                Cómo funciona
              </p>
              <h2 className="mt-3 text-[1.5rem] font-bold leading-tight text-surface-bg sm:text-[1.75rem]">
                Tres pasos para entrar
              </h2>
              <p className="mt-3 text-base leading-relaxed text-surface-bg/60">
                El proceso está diseñado para que llegues al bootcamp con el diagnóstico de tu empresa ya hecho.
              </p>
              <ol className="mt-8 flex flex-col gap-4">
                {steps.map(({ n, title, body }) => (
                  <li key={n} className="flex gap-4 rounded-[10px] border border-surface-bg/10 bg-white px-5 py-4 shadow-[var(--shadow-panel)]">
                    <span className="text-[1.125rem] font-bold leading-[1.4] text-green-600 shrink-0 w-7">{n}.</span>
                    <div>
                      <p className="text-sm font-bold text-surface-bg">{title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-surface-bg/60">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Form — right */}
            <div className="rounded-[10px] border border-surface-bg/10 bg-white p-6 shadow-[var(--shadow-panel-lg)] sm:p-8 lg:sticky lg:top-24">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-surface-bg/40">
                Paso 1 de 2
              </p>
              <h3 className="mt-2 text-lg font-bold text-surface-bg">
                Tus datos
              </h3>
              <ReservaPlazaForm locale={locale} />
            </div>

          </div>
        </SectionContainer>
      </section>
    </>
  );
}
