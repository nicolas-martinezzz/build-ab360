import type { ReactNode } from "react";
import { SectionContainer } from "@/components/ui/SectionContainer";

type LegalContentSectionProps = {
  title: string;
  children: ReactNode;
};

export const LegalContentSection = ({ title, children }: LegalContentSectionProps) => (
  <section aria-labelledby="legal-content-title" className="bg-white py-16 sm:py-20 md:py-24">
    <SectionContainer className="max-w-3xl">
      <h1 className="figma-title-3 text-surface-bg" id="legal-content-title">{title}</h1>
      <div className="figma-text-l mt-6 text-grey-dark">{children}</div>
    </SectionContainer>
  </section>
);
