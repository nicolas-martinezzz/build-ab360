import { describe, it, expect } from "vitest";
import { QS, RETOS, TOTAL_QUESTIONS } from "./data";
import {
  computeResults,
  getScoreLevelMeta,
  getScoreBandMeta,
  getDashboardMeta,
  getDynamicConclusion,
  getGoodAnswers,
} from "./scoring";
import type { ProfileKey } from "./types";

/* ─── Helpers ─── */
function allOptions(optionIndex: number): (number | null)[] {
  return Array(TOTAL_QUESTIONS).fill(optionIndex);
}

const ALL_PROFILES: ProfileKey[] = [
  "promotor_inversor",
  "direccion",
  "estudios_constructor",
  "delegado_pm",
  "arquitecto_ingeniero",
  "otro",
];

/* ─── computeResults ─── */
describe("computeResults", () => {
  describe("con todas las respuestas en la mejor opción (score=0)", () => {
    it("devuelve weightedScore=100 para todos los perfiles", () => {
      // La opción con s=0 es el índice 3 en todas las preguntas
      const bestAnswers = allOptions(3);
      for (const profile of ALL_PROFILES) {
        const r = computeResults(bestAnswers, profile);
        expect(r.weightedScore, `perfil ${profile}`).toBe(100);
        expect(r.scoreOver10, `perfil ${profile}`).toBeCloseTo(10.0, 1);
      }
    });

    it("dimensionPerformance tiene 100 en todas las dimensiones", () => {
      const bestAnswers = allOptions(3);
      const r = computeResults(bestAnswers, "direccion");
      expect(r.dimensionPerformance.A).toBe(100);
      expect(r.dimensionPerformance.B).toBe(100);
      expect(r.dimensionPerformance.C).toBe(100);
      expect(r.dimensionPerformance.D).toBe(100);
    });
  });

  describe("con todas las respuestas en la peor opción (score=100)", () => {
    it("devuelve weightedScore=0 para todos los perfiles", () => {
      const worstAnswers = allOptions(0);
      for (const profile of ALL_PROFILES) {
        const r = computeResults(worstAnswers, profile);
        expect(r.weightedScore, `perfil ${profile}`).toBe(0);
        expect(r.scoreOver10, `perfil ${profile}`).toBe(0);
      }
    });

    it("dimensionPerformance tiene 0 en todas las dimensiones", () => {
      const worstAnswers = allOptions(0);
      const r = computeResults(worstAnswers, "promotor_inversor");
      expect(r.dimensionPerformance.A).toBe(0);
      expect(r.dimensionPerformance.B).toBe(0);
      expect(r.dimensionPerformance.C).toBe(0);
      expect(r.dimensionPerformance.D).toBe(0);
    });
  });

  describe("con respuestas intermedias (opción 1, score=70)", () => {
    it("weightedScore está entre 0 y 100", () => {
      const midAnswers = allOptions(1);
      for (const profile of ALL_PROFILES) {
        const r = computeResults(midAnswers, profile);
        expect(r.weightedScore).toBeGreaterThanOrEqual(0);
        expect(r.weightedScore).toBeLessThanOrEqual(100);
      }
    });

    it("el score intermedio alto (opción 2, score=30) es mayor que el bajo (opción 1, score=70)", () => {
      const highMid = allOptions(2);
      const lowMid  = allOptions(1);
      const rHigh = computeResults(highMid, "direccion");
      const rLow  = computeResults(lowMid, "direccion");
      expect(rHigh.weightedScore).toBeGreaterThan(rLow.weightedScore);
    });
  });

  describe("profile influye en el scoring", () => {
    it("mismo set de respuestas produce scores distintos según el perfil (pesos diferentes)", () => {
      // Respuestas donde dim A es peor que dim D
      const answers = QS.map((q) => (q.dim === "A" ? 0 : 3));
      const r1 = computeResults(answers, "promotor_inversor"); // peso A=0.35, D=0.30
      const r2 = computeResults(answers, "delegado_pm");       // peso A=0.20, D=0.30
      // promotor_inversor pesa más A (malo) → score más bajo
      expect(r1.weightedScore).toBeLessThan(r2.weightedScore);
    });
  });

  describe("topRetos", () => {
    it("devuelve exactamente 3 retos", () => {
      const r = computeResults(allOptions(0), "direccion");
      expect(r.topRetos).toHaveLength(3);
    });

    it("los retos tienen priorityScore descendente (primero el más urgente)", () => {
      const r = computeResults(allOptions(0), "promotor_inversor");
      const scores = r.topRetos.map((t) => t.priorityScore);
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    });

    it("cada reto del top3 existe en la lista de RETOS", () => {
      const retoCodes = new Set(RETOS.map((r) => r.code));
      const r = computeResults(allOptions(0), "direccion");
      for (const t of r.topRetos) {
        expect(retoCodes.has(t.reto.code)).toBe(true);
      }
    });

    it("los 3 retos son distintos entre sí", () => {
      const r = computeResults(allOptions(0), "arquitecto_ingeniero");
      const codes = r.topRetos.map((t) => t.reto.code);
      expect(new Set(codes).size).toBe(3);
    });

    it("con las peores respuestas, priorityScore > 0 para los top retos", () => {
      const r = computeResults(allOptions(0), "promotor_inversor");
      for (const t of r.topRetos) {
        expect(t.priorityScore).toBeGreaterThan(0);
      }
    });

    it("con las mejores respuestas, priorityScore = 0", () => {
      const r = computeResults(allOptions(3), "promotor_inversor");
      for (const t of r.topRetos) {
        expect(t.priorityScore).toBe(0);
      }
    });
  });

  describe("estructura del resultado", () => {
    it("scoreOver10 es weightedScore / 10 con 1 decimal", () => {
      for (const profile of ALL_PROFILES) {
        const answers = allOptions(1); // mixed
        const r = computeResults(answers, profile);
        expect(r.scoreOver10).toBeCloseTo(r.weightedScore / 10, 1);
      }
    });

    it("devuelve el profile correcto", () => {
      const r = computeResults(allOptions(0), "arquitecto_ingeniero");
      expect(r.profile).toBe("arquitecto_ingeniero");
    });

    it("dimensionPerformance tiene las 4 dimensiones", () => {
      const r = computeResults(allOptions(2), "delegado_pm");
      expect(Object.keys(r.dimensionPerformance).sort()).toEqual(["A", "B", "C", "D"]);
    });

    it("dimensionPerformance valores en rango 0–100", () => {
      const r = computeResults(allOptions(1), "otro");
      for (const v of Object.values(r.dimensionPerformance)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("respuestas parciales (algunos null)", () => {
    it("tolera respuestas nulas sin lanzar error", () => {
      const partial = [0, null, 1, null, 2, null, 3, null, 0, null, 1, null];
      expect(() => computeResults(partial, "direccion")).not.toThrow();
    });

    it("con todas las respuestas null devuelve score=100 (fallback: sin datos = sin penalización)", () => {
      // Hereda el comportamiento del JS original: dimT.m===0 → dp=0 → perfDP=100
      const empty = Array(12).fill(null);
      const r = computeResults(empty, "direccion");
      expect(r.weightedScore).toBe(100);
    });
  });
});

/* ─── getScoreLevelMeta ─── */
describe("getScoreLevelMeta", () => {
  it("score=100 → nivel óptimo", () => {
    const m = getScoreLevelMeta(100);
    expect(m.label).toContain("bases");
  });

  it("score=85 → nivel 'bases'", () => {
    const m = getScoreLevelMeta(85);
    expect(m.label).toContain("bases");
  });

  it("score=70 → nivel 'huecos'", () => {
    const m = getScoreLevelMeta(70);
    expect(m.label).toContain("huecos");
  });

  it("score=45 → nivel 'coordinación'", () => {
    const m = getScoreLevelMeta(45);
    expect(m.label).toContain("coordinación");
  });

  it("score=0 → nivel 'depende del equipo'", () => {
    const m = getScoreLevelMeta(0);
    expect(m.label).toContain("equipo");
  });

  it("todos los niveles tienen label y copy no vacíos", () => {
    for (const score of [0, 20, 44, 45, 69, 70, 84, 85, 100]) {
      const m = getScoreLevelMeta(score);
      expect(m.label.trim()).not.toBe("");
      expect(m.copy.trim()).not.toBe("");
    }
  });
});

/* ─── getScoreBandMeta ─── */
describe("getScoreBandMeta", () => {
  const cases: [number, string][] = [
    [1.0,  "bases"],
    [0.85, "bases"],
    [0.70, "huecos"],
    [0.45, "coordinación"],
    [0.0,  "equipo"],
  ];

  it.each(cases)("pct=%.2f → band contiene '%s'", (pct, keyword) => {
    const band = getScoreBandMeta(pct);
    expect(band.title).toContain(keyword);
  });

  it("todos los campos están definidos en cualquier score", () => {
    for (const pct of [0, 0.3, 0.5, 0.75, 0.9, 1]) {
      const band = getScoreBandMeta(pct);
      expect(band.color).toMatch(/^(#|var\(--)/)
      expect(band.bandBg).toMatch(/^(#|var\(--)/);
      expect(band.title.trim()).not.toBe("");
      expect(band.sub.trim()).not.toBe("");
      expect(band.introText.trim()).not.toBe("");
    }
  });
});

/* ─── getDashboardMeta ─── */
describe("getDashboardMeta", () => {
  const cases: [number, string][] = [
    [100, "Bien asentado"],
    [85,  "Bien asentado"],
    [70,  "Funciona con huecos"],
    [45,  "Hay base"],
    [0,   "Requiere atención"],
  ];

  it.each(cases)("pct=%d → '%s'", (pct, expected) => {
    const dm = getDashboardMeta(pct);
    expect(dm.label).toContain(expected);
  });

  it("devuelve label, copy y tone en todos los rangos", () => {
    for (const pct of [0, 30, 44, 45, 69, 70, 84, 85, 100]) {
      const dm = getDashboardMeta(pct);
      expect(dm.label.trim()).not.toBe("");
      expect(dm.copy.trim()).not.toBe("");
      expect(dm.tone.trim()).not.toBe("");
    }
  });
});

/* ─── getDynamicConclusion ─── */
describe("getDynamicConclusion", () => {
  const blocks = [
    { name: "Decidir con datos",          value: 20 },
    { name: "Conocimiento del equipo",    value: 80 },
    { name: "Decisiones coordinadas",     value: 40 },
    { name: "Visión en tiempo real",      value: 60 },
  ];

  it("devuelve un string no vacío", () => {
    const text = getDynamicConclusion(50, blocks);
    expect(text.trim()).not.toBe("");
  });

  it("menciona el bloque más débil", () => {
    const text = getDynamicConclusion(50, blocks);
    expect(text).toContain("Decidir con datos");
  });

  it("menciona el bloque más fuerte", () => {
    const text = getDynamicConclusion(50, blocks);
    expect(text).toContain("Conocimiento del equipo");
  });

  it("varía el opening según el score", () => {
    const textHigh = getDynamicConclusion(90, blocks);
    const textLow  = getDynamicConclusion(10, blocks);
    expect(textHigh).not.toBe(textLow);
    expect(textHigh).toContain("bien asentada");
    expect(textLow).toContain("criterio individual");
  });
});

/* ─── getGoodAnswers ─── */
describe("getGoodAnswers", () => {
  it("con todas las peores respuestas (score=100) devuelve array vacío", () => {
    const result = getGoodAnswers(allOptions(0));
    expect(result).toHaveLength(0);
  });

  it("con todas las mejores respuestas (score=0) devuelve 12 entradas", () => {
    const result = getGoodAnswers(allOptions(3));
    expect(result).toHaveLength(12);
  });

  it("con respuestas intermedias altas (score=30) también cuenta como buenas", () => {
    const result = getGoodAnswers(allOptions(2));
    expect(result.length).toBeGreaterThan(0);
  });

  it("todas las entradas son strings no vacíos", () => {
    const result = getGoodAnswers(allOptions(3));
    for (const label of result) {
      expect(typeof label).toBe("string");
      expect(label.trim()).not.toBe("");
    }
  });

  it("respuestas nulas no se cuentan como buenas", () => {
    const empty = Array(12).fill(null);
    const result = getGoodAnswers(empty);
    expect(result).toHaveLength(0);
  });

  it("mezcla de buenas y malas: cuenta solo las buenas", () => {
    // índices pares → opción 3 (s=0, buena), impares → opción 0 (s=100, mala)
    const mixed = QS.map((_, i) => (i % 2 === 0 ? 3 : 0));
    const result = getGoodAnswers(mixed);
    expect(result.length).toBe(6);
  });
});
