import type { Article } from "./types";

export const article: Article = {
  slug: "gemelo-digital-semantico",
  publishedAt: "2025-12-05",
  readingTimeMin: 8,
  author: "Eduardo Núñez",
  authorRole: "COO de yutopias systems",
  categories: ["tecnologia", "datos"],
  coverImage: "/images/articles/gemelo-digital-semantico.jpg",
  coverImageAlt: "Modelo 3D de edificio con capas de datos superpuestas",
  featured: false,
  translations: {
    es: {
      title: "¿Dispone su activo de un Gemelo Digital Semántico? El estándar que viene",
      excerpt: "El gemelo digital ya no es una promesa tecnológica — es una infraestructura operativa real. Pero hay una diferencia crítica entre un modelo 3D digital y un gemelo digital semántico. Esa diferencia es lo que determina su valor real.",
      seoTitle: "Gemelo Digital Semántico en edificación | AB360 Blog",
      seoDescription: "Descubre qué es el gemelo digital semántico, por qué va más allá del BIM y el modelado 3D, y cómo está transformando la gestión de activos en el sector de la edificación.",
      content: [
        {
          type: "paragraph",
          text: "El término 'gemelo digital' lleva años circulando en el sector de la edificación. Se usa para describir desde un modelo BIM actualizado hasta sistemas de monitorización en tiempo real. El problema es que la ambigüedad del término esconde una diferencia crítica que determina el valor real de la tecnología.",
        },
        {
          type: "heading",
          level: 2,
          text: "La diferencia entre un modelo digital y un gemelo semántico",
        },
        {
          type: "paragraph",
          text: "Un modelo digital del edificio — sea BIM, CAD o cualquier representación geométrica — captura la geometría y los atributos estáticos del activo. Es una fotografía muy detallada. Útil para diseño y documentación. Pero no para decisiones operativas.",
        },
        {
          type: "paragraph",
          text: "Un gemelo digital semántico es fundamentalmente diferente. No solo representa el edificio — lo comprende. Captura las relaciones entre sus componentes, sus procesos de gestión, su historial de decisiones y sus métricas de comportamiento en tiempo real. La clave está en la semántica: los datos tienen significado en contexto, no solo valores en una base de datos.",
        },
        {
          type: "quote",
          text: "Un modelo BIM te dice qué hay en el edificio. Un gemelo digital semántico te dice cómo funciona, por qué se tomó cada decisión sobre él y qué ocurrirá si cambias algo.",
        },
        {
          type: "heading",
          level: 2,
          text: "Las cuatro capas de un gemelo digital semántico",
        },
        {
          type: "paragraph",
          text: "Para que un gemelo digital sea realmente semántico — capaz de soportar decisiones operativas reales — necesita integrar cuatro capas de información:",
        },
        {
          type: "list",
          items: [
            "Capa física: el modelo del activo con sus componentes, materiales y sistemas. El punto de partida, no el destino.",
            "Capa de datos en tiempo real: sensores, medidores, sistemas de gestión del edificio que actualizan el estado del gemelo de forma continua.",
            "Capa semántica: las relaciones entre componentes, procesos y decisiones. El 'porqué' que convierte los datos en contexto.",
            "Capa de inteligencia: los modelos analíticos y agentes de IA que convierten el contexto en recomendaciones accionables.",
          ],
        },
        {
          type: "heading",
          level: 2,
          text: "Por qué el BIM solo no es suficiente",
        },
        {
          type: "paragraph",
          text: "BIM ha sido el estándar de facto en la industria durante más de una década. Ha mejorado enormemente la colaboración en diseño y ha reducido errores en obra. Pero tiene limitaciones estructurales que lo hacen insuficiente como base para la gestión operativa del ciclo de vida:",
        },
        {
          type: "list",
          items: [
            "Los modelos BIM son estáticos: no se actualizan automáticamente con el estado real del edificio durante su operación.",
            "La interoperabilidad es limitada: los formatos IFC son un paso adelante, pero la mayoría de datos operativos del edificio viven fuera del modelo BIM.",
            "La semántica es débil: BIM captura geometría y atributos, pero no las relaciones causales entre decisiones y consecuencias.",
          ],
        },
        {
          type: "paragraph",
          text: "El gemelo digital semántico no reemplaza el BIM — lo trasciende. Usa el modelo BIM como capa base y lo enriquece con todas las dimensiones que el BIM por sí solo no puede capturar.",
        },
        {
          type: "heading",
          level: 2,
          text: "Aplicaciones reales en el ciclo de vida",
        },
        {
          type: "paragraph",
          text: "Las aplicaciones del gemelo digital semántico se extienden por todo el ciclo de vida del activo:",
        },
        {
          type: "list",
          items: [
            "Diseño: comparación de alternativas con impacto en coste, huella y energía calculado antes de la decisión.",
            "Construcción: seguimiento en tiempo real del avance versus planificación, con alertas tempranas de desviaciones.",
            "Operación: mantenimiento predictivo basado en datos de comportamiento real, optimización del consumo energético.",
            "Transacciones: due diligence basada en datos verificables del historial del activo, no en documentación estática.",
            "Ciclo de vida final: planificación de renovación, reconversión o demolición con datos de estado real del activo.",
          ],
        },
        {
          type: "heading",
          level: 2,
          text: "El gemelo digital semántico en AB360",
        },
        {
          type: "paragraph",
          text: "El núcleo de AB360 es un gemelo digital semántico del edificio. No es una capa de visualización — es la infraestructura de datos sobre la que operan los tres agentes de IA de la plataforma.",
        },
        {
          type: "paragraph",
          text: "SimuLab usa el gemelo para simular el impacto de decisiones de diseño en coste y sostenibilidad. Cycle Planner lo usa para convertir esas decisiones en planificación. Platón lo usa para asistir la toma de decisiones conectando datos, normativa y conocimiento del proyecto en tiempo real.",
        },
        {
          type: "callout",
          text: "Dentro de cinco años, la pregunta no será '¿tiene su activo un gemelo digital?' sino '¿qué tan inteligente es su gemelo?'. Las organizaciones que construyan esa infraestructura hoy estarán jugando un partido diferente al del resto.",
        },
        {
          type: "heading",
          level: 2,
          text: "Cómo evaluar si su activo está listo",
        },
        {
          type: "paragraph",
          text: "El primer paso para avanzar hacia un gemelo digital semántico no es tecnológico — es diagnóstico. Las preguntas que importan son: ¿Qué datos del activo están siendo capturados hoy? ¿Dónde están almacenados y en qué formatos? ¿Quién tiene acceso a ellos y cuándo? ¿Qué decisiones podrían tomarse mejor si esos datos estuvieran conectados?",
        },
        {
          type: "paragraph",
          text: "A partir de ese diagnóstico, el camino hacia un gemelo digital semántico se convierte en una hoja de ruta concreta, no en una apuesta tecnológica ciega.",
        },
      ],
    },
    en: {
      title: "Does your asset have a Semantic Digital Twin? The standard that is coming",
      excerpt: "The digital twin is no longer a technological promise — it is a real operational infrastructure. But there is a critical difference between a digital 3D model and a semantic digital twin. That difference determines its real value.",
      seoTitle: "Semantic Digital Twin in construction | AB360 Blog",
      seoDescription: "Discover what a semantic digital twin is, why it goes beyond BIM and 3D modelling, and how it is transforming asset management in the construction sector.",
      content: [
        {
          type: "paragraph",
          text: "The term 'digital twin' has been circulating in the construction sector for years. The problem is that the ambiguity of the term hides a critical difference that determines the real value of the technology.",
        },
        {
          type: "heading",
          level: 2,
          text: "The difference between a digital model and a semantic twin",
        },
        {
          type: "paragraph",
          text: "A digital building model captures geometry and static attributes. A semantic digital twin fundamentally differs — it does not just represent the building, it understands it. It captures relationships between components, management processes, decision history, and real-time performance metrics.",
        },
        {
          type: "quote",
          text: "A BIM model tells you what is in the building. A semantic digital twin tells you how it works, why every decision about it was made, and what will happen if you change something.",
        },
        {
          type: "callout",
          text: "Within five years, the question will not be 'does your asset have a digital twin?' but 'how intelligent is your twin?'. Organisations that build that infrastructure today will be playing a different game from the rest.",
        },
      ],
    },
    ca: {
      title: "Disposa el seu actiu d'un Bessó Digital Semàntic? L'estàndard que ve",
      excerpt: "El bessó digital ja no és una promesa tecnològica — és una infraestructura operativa real. Però hi ha una diferència crítica entre un model 3D digital i un bessó digital semàntic. Aquesta diferència és la que determina el seu valor real.",
      seoTitle: "Bessó Digital Semàntic en edificació | AB360 Blog",
      seoDescription: "Descobreix què és el bessó digital semàntic, per què va més enllà del BIM i el modelat 3D, i com està transformant la gestió d'actius al sector de l'edificació.",
      content: [
        {
          type: "paragraph",
          text: "El terme 'bessó digital' fa anys que circula al sector de l'edificació. El problema és que l'ambigüitat del terme amaga una diferència crítica que determina el valor real de la tecnologia.",
        },
        {
          type: "callout",
          text: "D'aquí a cinc anys, la pregunta no serà 'té el seu actiu un bessó digital?' sinó 'com d'intel·ligent és el seu bessó?'.",
        },
      ],
    },
  },
};
