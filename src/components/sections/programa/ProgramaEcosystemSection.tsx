import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const ITEM_KEYS = [
  "entryCard1Body", "entryCard2Body", "entryCard3Body", "entryCard4Body",
  "entryCard5Body", "entryCard6Body", "entryCard7Body", "entryCard8Body",
] as const;

type BenefitProps = { number: string; titlePrefix: string; titleSuffix: string; body: string };

const Benefit = ({ number, titlePrefix, titleSuffix, body }: BenefitProps) => (
  <li className="w-full">
    <div className="flex flex-col gap-2">
      <h3 className="figma-text-l-bold text-surface-bg">
        <span className="mr-1.5 text-green-500">{number}.</span>
        {titlePrefix}
        <br />
        {titleSuffix}
      </h3>
      <p className="figma-text-m text-grey-dark">{body}</p>
    </div>
  </li>
);

export const ProgramaEcosystemSection = async () => {
  const tBootcamp = await getTranslations("programaPage.bootcamp");

  const benefits: BenefitProps[] = ITEM_KEYS.map((key, index) => {
    const cardNum = index + 1;
    return {
      number: `${cardNum}`.padStart(2, "0"),
      titlePrefix: tBootcamp(`entryCard${cardNum}Title`),
      titleSuffix: "",
      body: tBootcamp(key),
    };
  });

  return (
    <section aria-label={tBootcamp("entryTitle")} className="section-block bg-white">
      <SectionContainer>
        <ul className="grid justify-items-start gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((b) => (
            <Benefit key={b.number} {...b} />
          ))}
        </ul>
      </SectionContainer>
    </section>
  );
};
