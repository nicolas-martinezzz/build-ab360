import type { Article } from "./types";

export const article: Article = {
  slug: "adios-a-los-silos",
  publishedAt: "2025-09-22",
  readingTimeMin: 5,
  author: "Eduardo Núñez",
  authorRole: "COO de yutopias systems",
  categories: ["datos", "tecnologia"],
  coverImage: "/images/articles/adios-a-los-silos.jpg",
  coverImageAlt: "Mujer revisando paneles de datos en oficina",
  featured: true,
  translations: {
    es: {
      title: "Adiós a los silos: La integración de datos que revoluciona el ciclo de vida de los edificios",
      excerpt: "La fragmentación de información entre actores del sector de la edificación genera ineficiencias, sobrecostes y decisiones tardías. La integración de datos transforma radicalmente cómo se gestiona todo el ciclo de vida del edificio.",
      seoTitle: "Adiós a los silos de datos en edificación | AB360 Blog",
      seoDescription: "Descubre cómo la integración de datos elimina los silos de información en el sector de la edificación y mejora la toma de decisiones en todo el ciclo de vida del edificio.",
      content: [
        {
          type: "paragraph",
          text: "El sector de la edificación sigue operando con una paradoja: nunca ha habido más datos disponibles y, sin embargo, las decisiones más críticas se toman con información incompleta, tardía o directamente equivocada.",
        },
        {
          type: "heading",
          level: 2,
          text: "El problema de los silos en edificación",
        },
        {
          type: "paragraph",
          text: "Cada actor del ciclo de vida de un edificio — promotores, arquitectos, constructoras, ingenieros, gestores de activos — trabaja con su propio ecosistema de datos. Los datos existen. El problema es que están atrapados en silos: sistemas incompatibles, formatos propietarios y procesos que no hablan entre sí.",
        },
        {
          type: "paragraph",
          text: "El resultado es predecible: cuando la información finalmente llega, la decisión ya está tomada. O peor: se usa para justificarla, no para mejorarla.",
        },
        {
          type: "quote",
          text: "Los datos existen. El problema es que están atrapados en silos: sistemas incompatibles, formatos propietarios y procesos que no hablan entre sí.",
        },
        {
          type: "heading",
          level: 2,
          text: "Qué significa realmente integrar datos",
        },
        {
          type: "paragraph",
          text: "Integrar datos no es simplemente conectar sistemas. Es crear un lenguaje común que permita que la información fluya entre actores en el momento en que es útil, no después. Implica tres capas que deben funcionar juntas:",
        },
        {
          type: "list",
          items: [
            "Interoperabilidad técnica: los sistemas deben poder comunicarse sin fricciones.",
            "Semántica compartida: los datos deben significar lo mismo para todos los actores.",
            "Temporalidad correcta: la información debe llegar cuando puede influir en la decisión, no cuando ya es irrelevante.",
          ],
        },
        {
          type: "heading",
          level: 2,
          text: "El gemelo digital semántico como respuesta",
        },
        {
          type: "paragraph",
          text: "En el centro de AB360 hay un gemelo digital semántico del edificio. No es una representación visual del activo — es una comprensión operativa. Integra los datos del objeto y los procesos de gestión de su ciclo de vida. Relaciona su significado. Desde la promoción hasta la explotación.",
        },
        {
          type: "paragraph",
          text: "Sobre ese núcleo operan tres agentes de IA especializados — SimuLab, Cycle Planner y Platón — cada uno diseñado para eliminar fricciones en una fase del ciclo de vida. El resultado no es solo eficiencia: es la capacidad de simular decisiones antes de ejecutarlas.",
        },
        {
          type: "heading",
          level: 2,
          text: "El impacto real de romper los silos",
        },
        {
          type: "paragraph",
          text: "Los beneficios de la integración de datos van mucho más allá de la eficiencia operativa. Cuando los datos fluyen correctamente entre actores:",
        },
        {
          type: "list",
          items: [
            "Las decisiones de diseño tienen en cuenta el impacto en coste, huella de carbono y consumo energético desde el primer momento.",
            "Los equipos de ejecución trabajan con información actualizada en tiempo real, no con versiones desincronizadas.",
            "Los gestores de activos pueden planificar el mantenimiento preventivo con datos reales de comportamiento del edificio.",
            "Los inversores pueden evaluar el riesgo climático y regulatorio sobre datos concretos, no estimaciones.",
          ],
        },
        {
          type: "callout",
          text: "La integración de datos no es un problema tecnológico. Es un problema de coordinación entre actores que operan con incentivos distintos. La tecnología es el habilitador — la voluntad de compartir datos, la clave.",
        },
        {
          type: "heading",
          level: 2,
          text: "El camino hacia adelante",
        },
        {
          type: "paragraph",
          text: "La integración de datos en edificación no ocurrirá de forma espontánea. Requiere estándares comunes, incentivos regulatorios y herramientas que hagan que compartir datos sea más valioso que mantenerlos en silos. La taxonomía europea de sostenibilidad y las nuevas directivas de eficiencia energética están empujando en esa dirección.",
        },
        {
          type: "paragraph",
          text: "Las organizaciones que entiendan esto primero — y actúen en consecuencia — no solo serán más eficientes. Serán las que definan el estándar del sector en la próxima década.",
        },
      ],
    },
    en: {
      title: "Goodbye to silos: The data integration that is revolutionising the building lifecycle",
      excerpt: "Information fragmentation among construction sector stakeholders generates inefficiencies, cost overruns, and late decisions. Data integration radically transforms how the entire building lifecycle is managed.",
      seoTitle: "Goodbye to data silos in construction | AB360 Blog",
      seoDescription: "Discover how data integration eliminates information silos in the construction sector and improves decision-making throughout the building lifecycle.",
      content: [
        {
          type: "paragraph",
          text: "The construction sector continues to operate with a paradox: there has never been more data available, yet the most critical decisions are made with incomplete, late, or simply wrong information.",
        },
        {
          type: "heading",
          level: 2,
          text: "The silo problem in construction",
        },
        {
          type: "paragraph",
          text: "Every stakeholder in the building lifecycle — developers, architects, contractors, engineers, asset managers — works within their own data ecosystem. The data exists. The problem is that it is trapped in silos: incompatible systems, proprietary formats, and processes that do not communicate with each other.",
        },
        {
          type: "paragraph",
          text: "The result is predictable: by the time the information arrives, the decision has already been made. Or worse — it is used to justify the decision, not to improve it.",
        },
        {
          type: "quote",
          text: "The data exists. The problem is that it is trapped in silos: incompatible systems, proprietary formats, and processes that do not communicate with each other.",
        },
        {
          type: "heading",
          level: 2,
          text: "What data integration really means",
        },
        {
          type: "paragraph",
          text: "Integrating data is not simply connecting systems. It means creating a common language that allows information to flow between stakeholders when it is useful, not after the fact. It involves three layers that must work together:",
        },
        {
          type: "list",
          items: [
            "Technical interoperability: systems must be able to communicate without friction.",
            "Shared semantics: data must mean the same thing to all stakeholders.",
            "Correct timing: information must arrive when it can influence a decision, not when it is already irrelevant.",
          ],
        },
        {
          type: "heading",
          level: 2,
          text: "The semantic digital twin as the answer",
        },
        {
          type: "paragraph",
          text: "At the core of AB360 is a semantic digital twin of the building. It is not a visual representation of the asset — it is an operational understanding. It integrates the object's data and the management processes of its lifecycle. It connects their meaning. From development to operation.",
        },
        {
          type: "heading",
          level: 2,
          text: "The real impact of breaking silos",
        },
        {
          type: "paragraph",
          text: "The benefits of data integration go far beyond operational efficiency. When data flows correctly between stakeholders, design decisions can account for cost, carbon footprint, and energy consumption from the very start.",
        },
        {
          type: "callout",
          text: "Data integration is not a technology problem. It is a coordination problem between actors operating with different incentives. Technology is the enabler — the willingness to share data is the key.",
        },
      ],
    },
    ca: {
      title: "Adéu als sitges: La integració de dades que revoluciona el cicle de vida dels edificis",
      excerpt: "La fragmentació d'informació entre actors del sector de l'edificació genera ineficiències, sobrecostos i decisions tardanes. La integració de dades transforma radicalment com es gestiona tot el cicle de vida de l'edifici.",
      seoTitle: "Adéu als sitges de dades en edificació | AB360 Blog",
      seoDescription: "Descobreix com la integració de dades elimina els sitges d'informació al sector de l'edificació i millora la presa de decisions en tot el cicle de vida de l'edifici.",
      content: [
        {
          type: "paragraph",
          text: "El sector de l'edificació continua operant amb una paradoxa: mai no hi ha hagut més dades disponibles i, tanmateix, les decisions més crítiques es prenen amb informació incompleta, tardana o directament errònia.",
        },
        {
          type: "heading",
          level: 2,
          text: "El problema dels sitges en edificació",
        },
        {
          type: "paragraph",
          text: "Cada actor del cicle de vida d'un edifici — promotors, arquitectes, constructores, enginyers, gestors d'actius — treballa amb el seu propi ecosistema de dades. Les dades existeixen. El problema és que estan atrapades en sitges: sistemes incompatibles, formats propietaris i processos que no es comuniquen entre si.",
        },
        {
          type: "callout",
          text: "La integració de dades no és un problema tecnològic. És un problema de coordinació entre actors que operen amb incentius diferents.",
        },
      ],
    },
  },
};
