import { describe, it, expect } from "vitest";
import {
  QS,
  RETOS,
  DIM,
  PROFILE_META,
  PROFILE_QUESTIONS,
  TOTAL_QUESTIONS,
  GOOD_ANSWER_LABELS,
} from "./data";

const PROFILES = Object.keys(PROFILE_META) as (keyof typeof PROFILE_META)[];
const VALID_DIMS = ["A", "B", "C", "D"] as const;

describe("QS — questions array", () => {
  it("tiene exactamente 12 preguntas", () => {
    expect(QS).toHaveLength(TOTAL_QUESTIONS);
    expect(TOTAL_QUESTIONS).toBe(12);
  });

  it("cada pregunta tiene exactamente 4 opciones", () => {
    for (const [i, q] of QS.entries()) {
      expect(q.opts, `Q${i} opts count`).toHaveLength(4);
    }
  });

  it("los scores de cada opción son 0, 30, 70 o 100 (en cualquier orden)", () => {
    const validScores = new Set([0, 30, 70, 100]);
    for (const [i, q] of QS.entries()) {
      for (const [j, opt] of q.opts.entries()) {
        expect(
          validScores.has(opt.s),
          `Q${i} opt${j} score=${opt.s} no es válido`
        ).toBe(true);
      }
    }
  });

  it("las 4 opciones de cada pregunta tienen scores distintos", () => {
    for (const [i, q] of QS.entries()) {
      const scores = q.opts.map((o) => o.s);
      const unique = new Set(scores);
      expect(unique.size, `Q${i} tiene scores duplicados`).toBe(4);
    }
  });

  it("cada pregunta tiene dimensión válida", () => {
    for (const [i, q] of QS.entries()) {
      expect(
        VALID_DIMS.includes(q.dim as (typeof VALID_DIMS)[number]),
        `Q${i} dim=${q.dim}`
      ).toBe(true);
    }
  });

  it("cada reto referenciado existe en RETOS", () => {
    const retoCodes = new Set(RETOS.map((r) => r.code));
    for (const [i, q] of QS.entries()) {
      for (const code of q.retos) {
        expect(retoCodes.has(code), `Q${i} reto=${code} no encontrado`).toBe(true);
      }
    }
  });

  it("todas las preguntas tienen texto y subtexto no vacíos", () => {
    for (const [i, q] of QS.entries()) {
      expect(q.text.trim(), `Q${i} text vacío`).not.toBe("");
      expect(q.sub.trim(), `Q${i} sub vacío`).not.toBe("");
    }
  });
});

describe("RETOS — challenges", () => {
  it("tiene 12 retos", () => {
    expect(RETOS).toHaveLength(12);
  });

  it("cada reto tiene dimensión válida", () => {
    for (const r of RETOS) {
      expect(VALID_DIMS.includes(r.dim as (typeof VALID_DIMS)[number]), `Reto ${r.code}`).toBe(true);
    }
  });

  it("todos los códigos de reto son únicos", () => {
    const codes = RETOS.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("cada reto tiene nombre, situación y objetivo no vacíos", () => {
    for (const r of RETOS) {
      expect(r.name.trim(), `${r.code} name`).not.toBe("");
      expect(r.sit.trim(), `${r.code} sit`).not.toBe("");
      expect(r.obj.trim(), `${r.code} obj`).not.toBe("");
    }
  });
});

describe("DIM — dimensions", () => {
  it("tiene las 4 dimensiones A, B, C, D", () => {
    expect(Object.keys(DIM).sort()).toEqual(["A", "B", "C", "D"]);
  });

  it("cada dimensión tiene nombre, short, y colores definidos", () => {
    for (const [k, d] of Object.entries(DIM)) {
      expect(d.name.trim(), `DIM ${k} name`).not.toBe("");
      expect(d.short.trim(), `DIM ${k} short`).not.toBe("");
      expect(d.color, `DIM ${k} color`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(d.bg, `DIM ${k} bg`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(d.dark, `DIM ${k} dark`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("PROFILE_META — profile configuration", () => {
  it("tiene los 6 perfiles definidos", () => {
    expect(Object.keys(PROFILE_META).sort()).toEqual([
      "arquitecto_ingeniero",
      "delegado_pm",
      "direccion",
      "estudios_constructor",
      "otro",
      "promotor_inversor",
    ]);
  });

  it.each(PROFILES)("perfil %s: weights suman 1.0", (p) => {
    const w = PROFILE_META[p].weights;
    const sum = w.A + w.B + w.C + w.D;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it.each(PROFILES)("perfil %s: priorities cubre las 4 dimensiones", (p) => {
    const prios = PROFILE_META[p].priorities;
    expect(prios.sort()).toEqual(["A", "B", "C", "D"]);
  });

  it.each(PROFILES)("perfil %s: retoContext tiene al menos 8 entradas", (p) => {
    const ctx = PROFILE_META[p].retoContext;
    expect(Object.keys(ctx).length).toBeGreaterThanOrEqual(8);
  });

  it.each(PROFILES)("perfil %s: todos los códigos de retoContext existen en RETOS", (p) => {
    const retoCodes = new Set(RETOS.map((r) => r.code));
    for (const code of Object.keys(PROFILE_META[p].retoContext)) {
      expect(retoCodes.has(code), `${p} retoContext código ${code} no existe`).toBe(true);
    }
  });
});

describe("PROFILE_QUESTIONS", () => {
  it.each(PROFILES)("perfil %s: tiene exactamente 12 preguntas", (p) => {
    expect(PROFILE_QUESTIONS[p]).toHaveLength(12);
  });

  it.each(PROFILES)("perfil %s: todas las preguntas son strings no vacíos", (p) => {
    for (const [i, text] of PROFILE_QUESTIONS[p].entries()) {
      expect(typeof text, `${p} Q${i}`).toBe("string");
      expect(text.trim(), `${p} Q${i} vacío`).not.toBe("");
    }
  });
});

describe("GOOD_ANSWER_LABELS", () => {
  it("tiene exactamente 12 entradas (una por pregunta)", () => {
    expect(Object.keys(GOOD_ANSWER_LABELS)).toHaveLength(12);
  });

  it("cubre los índices 0–11", () => {
    for (let i = 0; i < 12; i++) {
      expect(GOOD_ANSWER_LABELS[i], `índice ${i}`).toBeDefined();
      expect(GOOD_ANSWER_LABELS[i].trim()).not.toBe("");
    }
  });
});
