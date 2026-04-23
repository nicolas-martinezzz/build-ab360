import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const ITEM_KEYS = [
  "agenda1Title", "agenda2Title", "agenda3Title", "agenda4Title",
  "agenda5Title", "agenda6Title", "agenda7Title", "agenda8Title",
] as const;

type BenefitProps = { number: string; title: string; body: string };

const Benefit = ({ number, title, body }: BenefitProps) => (
  <li className="max-w-[15.75rem]">
    <div className="flex flex-col gap-2.5">
      <h3 className="text-[1.9375rem] font-bold leading-[1.28] text-surface-bg">
        <span className="mr-2 text-green-500">{number}.</span>
        {title}
      </h3>
      <p className="figma-text-l text-grey-dark">{body}</p>
    </div>
  </li>
);

export const ProgramaEcosystemSection = async () => {
  const tBootcamp = await getTranslations("programaPage.bootcamp");

  const title = `${tBootcamp("headline")}: ${tBootcamp("entryTitle")}`;
  const benefits: BenefitProps[] = ITEM_KEYS.map((key, index) => ({
    number: `${index + 1}`.padStart(2, "0"),
    title,
    body: tBootcamp(key),
  }));

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <SectionContainer>
        <ul className="grid justify-items-start gap-x-8 gap-y-10 md:grid-cols-2 lg:gap-x-10 xl:grid-cols-4">
          {benefits.map((b) => (
            <Benefit key={b.number} {...b} />
          ))}
        </ul>
      </SectionContainer>
    </section>
  );
};
