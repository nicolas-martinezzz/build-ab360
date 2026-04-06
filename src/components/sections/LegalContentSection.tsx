import type { ReactNode } from "react";
import { SectionContainer } from "@/components/ui/SectionContainer";

type LegalContentSectionProps = {
  title: string;
  children: ReactNode;
};

export const LegalContentSection = ({ title, children }: LegalContentSectionProps) => (
  <section className="bg-white py-16 sm:py-20 md:py-24">
    <SectionContainer className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-surface-bg sm:text-3xl">{title}</h1>
      <div className="mt-6 text-base leading-relaxed text-grey-dark">{children}</div>
    </SectionContainer>
  </section>
);
