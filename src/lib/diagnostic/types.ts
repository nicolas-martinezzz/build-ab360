export type ProfileKey =
  | "promotor_inversor"
  | "direccion"
  | "estudios_constructor"
  | "delegado_pm"
  | "arquitecto_ingeniero"
  | "otro";

export type DimensionKey = "A" | "B" | "C" | "D";

export type QuestionOption = {
  t: string;
  s: number; // 0 = óptimo, 100 = peor situación
};

export type Question = {
  dim: DimensionKey;
  retos: string[];
  text: string;
  sub: string;
  opts: QuestionOption[];
};

export type Reto = {
  code: string;
  dim: DimensionKey;
  name: string;
  sit: string;
  obj: string;
};

export type Dimension = {
  name: string;
  short: string;
  color: string;
  bg: string;
  dark: string;
};

export type ProfileMeta = {
  label: string;
  weights: Record<DimensionKey, number>;
  summary: string;
  priorities: DimensionKey[];
  retoContext: Record<string, string>;
};

export type DiagnosticResults = {
  weightedScore: number;   // 0–100, alto = mejor
  scoreOver10: number;     // weighted / 10
  profile: ProfileKey;
  topRetos: ComputedReto[];
  dimensionPerformance: Record<DimensionKey, number>; // 0–100
};

export type ComputedReto = {
  reto: Reto;
  severity: number;
  priorityScore: number;
  priorityLabel: string;
  dimMeta: Dimension;
  profileContext: string;
};

export type LeadData = {
  name: string;
  company: string;
  email: string;
};
