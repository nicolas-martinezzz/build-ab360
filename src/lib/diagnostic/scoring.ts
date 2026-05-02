import { QS, RETOS, DIM, PROFILE_META, GOOD_ANSWER_LABELS } from "./data";
import type { ProfileKey, DiagnosticResults, ComputedReto, DimensionKey } from "./types";

export function computeResults(
  answers: (number | null)[],
  profile: ProfileKey
): DiagnosticResults {
  const dimTotals: Record<DimensionKey, { t: number; m: number }> = {
    A: { t: 0, m: 0 },
    B: { t: 0, m: 0 },
    C: { t: 0, m: 0 },
    D: { t: 0, m: 0 },
  };

  const retoScores: Record<string, number> = {};
  const retoMax: Record<string, number> = {};
  for (const r of RETOS) {
    retoScores[r.code] = 0;
    retoMax[r.code] = 0;
  }

  QS.forEach((q, i) => {
    const a = answers[i];
    if (a === null) return;
    const score = q.opts[a].s;
    dimTotals[q.dim].t += score;
    dimTotals[q.dim].m += 100;
    for (const code of q.retos) {
      retoScores[code] += score;
      retoMax[code] += 100;
    }
  });

  // raw dimension score (high = bad)
  const dp: Record<DimensionKey, number> = {
    A: dimTotals.A.m > 0 ? Math.round((dimTotals.A.t / dimTotals.A.m) * 100) : 0,
    B: dimTotals.B.m > 0 ? Math.round((dimTotals.B.t / dimTotals.B.m) * 100) : 0,
    C: dimTotals.C.m > 0 ? Math.round((dimTotals.C.t / dimTotals.C.m) * 100) : 0,
    D: dimTotals.D.m > 0 ? Math.round((dimTotals.D.t / dimTotals.D.m) * 100) : 0,
  };

  // performance (inverted: high = good)
  const perfDP: Record<DimensionKey, number> = {
    A: 100 - dp.A,
    B: 100 - dp.B,
    C: 100 - dp.C,
    D: 100 - dp.D,
  };

  const meta = PROFILE_META[profile];
  const weightedScore = Math.round(
    perfDP.A * meta.weights.A +
    perfDP.B * meta.weights.B +
    perfDP.C * meta.weights.C +
    perfDP.D * meta.weights.D
  );

  const maxWeight = Math.max(...Object.values(meta.weights));

  const allRetos: ComputedReto[] = RETOS.map((r) => {
    const severity = retoMax[r.code] > 0 ? retoScores[r.code] / retoMax[r.code] : 0;
    const priorityScore = maxWeight > 0
      ? Math.round(severity * 100 * (meta.weights[r.dim] / maxWeight))
      : 0;
    return {
      reto: r,
      severity,
      priorityScore,
      priorityLabel: getPriorityLabel(priorityScore),
      dimMeta: DIM[r.dim],
      profileContext: meta.retoContext[r.code] ?? "",
    };
  }).sort((a, b) =>
    b.priorityScore !== a.priorityScore
      ? b.priorityScore - a.priorityScore
      : b.severity - a.severity
  );

  return {
    weightedScore,
    scoreOver10: Number((weightedScore / 10).toFixed(1)),
    profile,
    topRetos: allRetos.slice(0, 3),
    dimensionPerformance: perfDP,
  };
}

function getPriorityLabel(score: number): string {
  if (score >= 75) return "Muy alta";
  if (score >= 50) return "Alta";
  if (score >= 30) return "Media";
  return "A seguir";
}

export function getScoreLevelMeta(score: number) {
  if (score >= 85) return {
    label: "Tienes las bases. Falta conectarlas.",
    copy: "La mayoría de tus procesos ya funcionan bien. El siguiente paso es integrar los que todavía viven aislados — para que el conjunto opere como un sistema, no como piezas sueltas.",
  };
  if (score >= 70) return {
    label: "Buena base. Pero pierdes dinero por los huecos.",
    copy: "Hay cosas que funcionan. Otras dependen de trabajo manual o de personas concretas. Esos huecos son los que más te erosionan el margen sin que los veas venir.",
  };
  if (score >= 45) return {
    label: "Funciona. Pero la coordinación te cuesta dinero.",
    copy: "Se trabaja con cierto orden, pero la información entre fases y entre equipos no fluye. El retrabajo y los desvíos tardíos nacen casi siempre aquí.",
  };
  return {
    label: "Todo depende del equipo. Si alguien se va, se va contigo.",
    copy: "Tu organización funciona por el criterio de las personas, no por sistemas. Es valioso, pero frágil — y difícil de escalar cuando el equipo cambia.",
  };
}

export function getScoreBandMeta(weightedPct: number) {
  if (weightedPct >= 0.85) return {
    color: "#127334", bandBg: "#E4F1CF",
    title: "Tienes las bases. Falta conectarlas.",
    sub: "Tu organización ya funciona con prácticas sólidas en casi todas las áreas. Los retos que siguen no son urgencias: son oportunidades de integrar lo que ya hace bien para que el conjunto opere como un sistema.",
    introText: "Con esta base, estos retos son el siguiente paso — conectar lo que ya funciona por separado.",
  };
  if (weightedPct >= 0.70) return {
    color: "#127334", bandBg: "#E4F1CF",
    title: "Buena base. Pero pierdes dinero por los huecos.",
    sub: "Hay cosas que funcionan bien. Otras dependen de trabajo manual o de personas concretas. Esos huecos tienen un coste que no se ve hasta que hay un problema.",
    introText: "Estos son los retos donde hoy pierdes más margen, plazo o criterio técnico de forma sistemática.",
  };
  if (weightedPct >= 0.45) return {
    color: "#127334", bandBg: "#E4F1CF",
    title: "Funciona. Pero la coordinación te cuesta dinero.",
    sub: "La información no fluye bien entre fases, herramientas y equipos. El retrabajo, los desvíos que aparecen tarde y las decisiones tomadas a ciegas tienen aquí su origen habitual.",
    introText: "Estos retos explican buena parte de las fricciones del día a día. Resolverlos es ganar margen y plazo, no solo mejorar procesos.",
  };
  return {
    color: "#127334", bandBg: "#E4F1CF",
    title: "Todo depende del equipo. Si alguien se va, se va contigo.",
    sub: "Tu organización funciona por el criterio y la experiencia de las personas — lo cual es valioso. Pero esa dependencia limita tu capacidad de escalar, anticipar problemas y mantener la calidad cuando el equipo cambia.",
    introText: "Estos son los retos que más impacto tienen en tu estabilidad y capacidad de crecer a corto plazo.",
  };
}

export function getDashboardMeta(pct: number) {
  if (pct >= 85) return { label: "Bien asentado",         copy: "Este bloque ya opera con buenas prácticas. El foco es mantener la consistencia y conectarlo con los otros bloques.", tone: "rgba(27,107,58,0.12)" };
  if (pct >= 70) return { label: "Funciona con huecos",   copy: "Hay procesos establecidos, pero dependen de trabajo manual o de personas concretas. Eso erosiona fiabilidad y escalabilidad.", tone: "rgba(46,157,78,0.12)" };
  if (pct >= 45) return { label: "Hay base, falta conectar", copy: "Existen herramientas parciales, pero la información no fluye entre ellas. De ahí el retrabajo y los errores de coordinación.", tone: "rgba(58,167,109,0.14)" };
  return { label: "Requiere atención prioritaria", copy: "Este bloque opera reactivamente y depende de personas. Es el origen más probable de desvíos y pérdida de conocimiento.", tone: "rgba(107,195,140,0.12)" };
}

export function getDynamicConclusion(
  score: number,
  blocks: { name: string; value: number }[]
): string {
  const weakest = [...blocks].sort((a, b) => a.value - b.value).slice(0, 2);
  const strongest = [...blocks].sort((a, b) => b.value - a.value)[0];

  let opening: string;
  if (score >= 85)      opening = "La organización tiene una base de gestión bien asentada en la mayoría de sus dimensiones.";
  else if (score >= 70) opening = "La organización trabaja con criterio y experiencia, y hay prácticas bien establecidas en algunas áreas.";
  else if (score >= 45) opening = "La organización tiene procesos en marcha, aunque la coordinación entre ellos todavía genera fricciones visibles en el día a día.";
  else                  opening = "La gestión actual descansa principalmente en el criterio individual de las personas clave, lo que limita la capacidad de anticipar y escalar.";

  const wNames = weakest.map((b) => b.name).join(" y ");
  const weakness = ` El mayor margen de mejora está en ${wNames}, donde los procesos actuales generan costes ocultos — en retrabajo, en desvíos que se detectan tarde o en decisiones que se toman sin toda la información disponible.`;
  const strength = ` El área de ${strongest.name} es donde la organización ya opera con más solidez y puede servir de base para el siguiente paso.`;

  return opening + weakness + strength;
}

export function getGoodAnswers(answers: (number | null)[]): string[] {
  const result: string[] = [];
  answers.forEach((a, i) => {
    if (a !== null && QS[i].opts[a].s <= 30) {
      const label = GOOD_ANSWER_LABELS[i];
      if (label) result.push(label);
    }
  });
  return result;
}
