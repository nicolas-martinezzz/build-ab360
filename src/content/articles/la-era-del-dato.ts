import type { Article } from "./types";

export const article: Article = {
  slug: "la-era-del-dato",
  publishedAt: "2025-11-10",
  readingTimeMin: 7,
  author: "Eduardo Núñez",
  authorRole: "COO de yutopias systems",
  categories: ["datos", "estrategia"],
  coverImage: "/images/articles/la-era-del-dato.jpg",
  coverImageAlt: "Visualización de flujos de datos en pantalla oscura",
  featured: false,
  translations: {
    es: {
      title: "La era del dato en edificación: de la intuición a la inteligencia operativa",
      excerpt: "El sector de la edificación lleva décadas tomando decisiones basadas en experiencia e intuición. La transición hacia decisiones basadas en datos no es una opción — es una condición de supervivencia competitiva.",
      seoTitle: "La era del dato en edificación | AB360 Blog",
      seoDescription: "Cómo la transición de la intuición a la inteligencia operativa basada en datos transforma la edificación. El rol de los datos en la toma de decisiones de construcción y gestión de activos.",
      content: [
        {
          type: "paragraph",
          text: "Hay un consenso implícito en el sector de la edificación que durante décadas ha funcionado como un axioma: la experiencia basta. Un buen promotor sabe qué funciona. Un arquitecto experimentado conoce los materiales. Un director de obra con veinte años en el sector no necesita un modelo para estimar riesgos.",
        },
        {
          type: "paragraph",
          text: "Ese axioma ya no es verdadero. No porque la experiencia haya perdido valor — sigue siendo fundamental. Sino porque el entorno en el que se toman decisiones ha cambiado radicalmente en complejidad, velocidad y consecuencias.",
        },
        {
          type: "heading",
          level: 2,
          text: "Por qué la intuición ya no es suficiente",
        },
        {
          type: "paragraph",
          text: "Tres fuerzas están presionando simultáneamente sobre el sector y cambiando las reglas del juego:",
        },
        {
          type: "list",
          items: [
            "Regulación creciente: la taxonomía europea, la EPBD y los requisitos de reporting ESG exigen datos verificables, no estimaciones. Lo que antes era opcional hoy es obligatorio.",
            "Márgenes en compresión: la volatilidad en precios de materiales y energía hace que la capacidad de simular escenarios antes de comprometerse sea una ventaja competitiva directa.",
            "Complejidad sistémica: un edificio moderno involucra más actores, más normativas y más interdependencias que cualquier proyecto de hace veinte años. La experiencia de uno no cubre la complejidad del sistema.",
          ],
        },
        {
          type: "quote",
          text: "No es que la experiencia sea mala. Es que la experiencia sin datos se convierte en un riesgo gestionado a ciegas.",
        },
        {
          type: "heading",
          level: 2,
          text: "Qué significa operar con inteligencia de datos",
        },
        {
          type: "paragraph",
          text: "La inteligencia operativa basada en datos no reemplaza el juicio humano — lo amplifica. Significa tener acceso a información relevante en el momento en que puede influir en una decisión. Significa poder comparar escenarios antes de ejecutar. Significa que cuando alguien propone una solución constructiva, puedes ver inmediatamente su impacto en coste, huella de carbono y consumo energético.",
        },
        {
          type: "paragraph",
          text: "La diferencia entre operar con y sin datos no es de eficiencia marginal. Es estructural: el que opera con datos puede aprender y mejorar de forma sistemática. El que opera sin ellos repite los mismos errores con mejor packaging.",
        },
        {
          type: "heading",
          level: 2,
          text: "Los datos que importan en edificación",
        },
        {
          type: "paragraph",
          text: "No todos los datos tienen el mismo valor. En el contexto de la edificación, los datos que generan mayor ventaja competitiva son aquellos que conectan tres dimensiones que normalmente operan en silos:",
        },
        {
          type: "list",
          items: [
            "Datos de coste: no solo el presupuesto estimado, sino el coste real por partida, por tipología, actualizado con la volatilidad de mercado.",
            "Datos de sostenibilidad: huellas de carbono, energética e hídrica por solución constructiva, calculadas con metodologías estandarizadas (ACV).",
            "Datos de ciclo de vida: mantenimiento, degradación, valor residual — los datos que determinan el coste total de propiedad del activo.",
          ],
        },
        {
          type: "heading",
          level: 2,
          text: "El gemelo digital como infraestructura de datos",
        },
        {
          type: "paragraph",
          text: "El gemelo digital semántico no es una representación visual del edificio. Es la infraestructura que hace posible que los datos del activo sean accesibles, relacionados y útiles para la toma de decisiones en tiempo real. Cada decisión que se toma sobre el edificio — desde el diseño hasta la operación — queda registrada y conectada con sus consecuencias.",
        },
        {
          type: "paragraph",
          text: "AB360 construye sobre este principio. El gemelo digital semántico es el núcleo. Los agentes de IA — SimuLab, Cycle Planner y Platón — son las interfaces que convierten esos datos en inteligencia operativa para cada actor del ciclo de vida.",
        },
        {
          type: "heading",
          level: 2,
          text: "Cómo empezar la transición",
        },
        {
          type: "paragraph",
          text: "La transición hacia operaciones basadas en datos no requiere un cambio radical de la noche a la mañana. Requiere empezar a capturar datos sistemáticamente donde antes no existían, y usar esos datos para tomar al menos una decisión diferente a la que habrías tomado sin ellos. Eso es todo. El aprendizaje acumulativo hace el resto.",
        },
        {
          type: "callout",
          text: "Las organizaciones que empiecen antes a operar con datos no solo serán más eficientes. Serán las que tengan el mayor activo competitivo del sector en los próximos diez años: datos propios que nadie más tiene.",
        },
      ],
    },
    en: {
      title: "The data era in construction: from intuition to operational intelligence",
      excerpt: "The construction sector has been making decisions based on experience and intuition for decades. The shift to data-driven decisions is not an option — it is a condition of competitive survival.",
      seoTitle: "The data era in construction | AB360 Blog",
      seoDescription: "How the shift from intuition to data-driven operational intelligence is transforming construction. The role of data in construction decision-making and asset management.",
      content: [
        {
          type: "paragraph",
          text: "There is an implicit consensus in the construction sector that has functioned as an axiom for decades: experience is enough. That axiom is no longer true — not because experience has lost value, but because the environment in which decisions are made has changed radically in complexity, speed, and consequences.",
        },
        {
          type: "heading",
          level: 2,
          text: "Why intuition is no longer enough",
        },
        {
          type: "list",
          items: [
            "Growing regulation: the EU taxonomy, EPBD, and ESG reporting requirements demand verifiable data, not estimates.",
            "Compressed margins: volatility in materials and energy prices makes the ability to simulate scenarios before committing a direct competitive advantage.",
            "Systemic complexity: a modern building involves more stakeholders, more regulations, and more interdependencies than any project from twenty years ago.",
          ],
        },
        {
          type: "callout",
          text: "Organisations that start operating with data earlier will not only be more efficient. They will have the greatest competitive asset in the sector over the next ten years: proprietary data that no one else has.",
        },
      ],
    },
    ca: {
      title: "L'era de les dades en edificació: de la intuïció a la intel·ligència operativa",
      excerpt: "El sector de l'edificació porta dècades prenent decisions basades en experiència i intuïció. La transició cap a decisions basades en dades no és una opció — és una condició de supervivència competitiva.",
      seoTitle: "L'era de les dades en edificació | AB360 Blog",
      seoDescription: "Com la transició de la intuïció a la intel·ligència operativa basada en dades transforma l'edificació.",
      content: [
        {
          type: "paragraph",
          text: "Hi ha un consens implícit al sector de l'edificació que durant dècades ha funcionat com un axioma: l'experiència n'hi ha prou. Aquest axioma ja no és veritat.",
        },
        {
          type: "callout",
          text: "Les organitzacions que comencin abans a operar amb dades no només seran més eficients. Seran les que tinguin el major actiu competitiu del sector en els propers deu anys.",
        },
      ],
    },
  },
};
