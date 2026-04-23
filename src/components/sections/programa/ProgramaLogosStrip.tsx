import { SectionContainer } from "@/components/ui/SectionContainer";
import { LinkButton } from "@/components/ui/LinkButton";
import { SITE_PATHS } from "@/config/routes";

export const ProgramaLogosStrip = () => (
  <section aria-label="Información destacada del programa">
    <div className="bg-green-500 py-2.5">
      <SectionContainer className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-semibold leading-[1.3] text-white">
          Inscripciones al Bootcamp Zero para Julio 2026 en Barcelona abiertas
        </p>
        <LinkButton
          className="h-9 rounded-[6px] bg-white px-6 py-2 text-sm font-semibold text-surface-bg hover:bg-white/90"
          href={SITE_PATHS.contact}
        >
          Saber mas
        </LinkButton>
      </SectionContainer>
    </div>

    <div className="bg-[#fbfff4] py-12 md:py-16">
      <SectionContainer className="grid gap-10 md:grid-cols-2 md:gap-16">
        <p className="max-w-[32rem] text-[2rem] leading-[1.25] text-surface-bg">
          Si lo que buscas es una formacion o una consultoria, hay mejores sitios.
          <br />
          Esto es otra cosa.
        </p>

        <p className="max-w-[32rem] justify-self-start text-[2rem] leading-[1.25] text-surface-bg md:justify-self-end">
          <span className="font-bold text-green-500">
            Los primeros partners co-crean el sistema y salen antes.
          </span>
          <br />
          Los que lleguen despues encontraran las reglas ya escritas y pagaran por usarlas.
        </p>
      </SectionContainer>
    </div>
  </section>
);
