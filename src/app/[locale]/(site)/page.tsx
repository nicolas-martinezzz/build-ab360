import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/home/Hero";
import { HomePageSections } from "@/components/sections/home/HomePageSections";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <div className="relative bg-surface-bg">
        <Hero locale={locale} />
      </div>
      <HomePageSections />
    </>
  );
}
