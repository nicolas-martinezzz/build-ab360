import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
  return <ReservaPlazaForm locale={locale} />;
}
