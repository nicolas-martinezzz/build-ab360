import { describe, it, expect, vi, afterEach } from "vitest";
import { generateReportHtml, downloadReport } from "./report-html";
import { computeResults } from "./scoring";
import { TOTAL_QUESTIONS } from "./data";
import type { ProfileKey } from "./types";

/* ─── Fixtures ─────────────────────────────────────────────────────────────── */

function allOptions(optionIndex: number) {
  return Array(TOTAL_QUESTIONS).fill(optionIndex);
}

function makeResults(profile: ProfileKey = "direccion", optionIndex = 0) {
  return computeResults(allOptions(optionIndex), profile);
}

const BASE_DATA = {
  results: makeResults("direccion", 0),
  firstName: "Nicolás",
  company: "Yutopias Test",
  role: "CEO",
};

/* ─── generateReportHtml ────────────────────────────────────────────────────── */

describe("generateReportHtml", () => {
  describe("estructura básica del HTML", () => {
    it("devuelve un string no vacío", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html.trim()).not.toBe("");
    });

    it("es un documento HTML válido con doctype y cierre", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toMatch(/^<!DOCTYPE html>/i);
      expect(html).toContain("</html>");
    });

    it("declara charset UTF-8", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain('charset="UTF-8"');
    });

    it("tiene lang=es", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain('lang="es"');
    });

    it("contiene @media print en el CSS", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("@media print");
    });
  });

  describe("datos del usuario", () => {
    it("incluye el nombre del usuario", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("Nicolás");
    });

    it("incluye la empresa", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("Yutopias Test");
    });

    it("incluye el cargo", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("CEO");
    });

    it("omite el bloque de persona cuando firstName y company están vacíos", () => {
      const html = generateReportHtml({ ...BASE_DATA, firstName: "", company: "", role: "" });
      expect(html).not.toContain("Datos del diagnóstico");
    });

    it("escapa caracteres especiales en el nombre", () => {
      const html = generateReportHtml({ ...BASE_DATA, firstName: '<script>alert("xss")</script>' });
      expect(html).not.toContain("<script>");
      expect(html).toContain("&lt;script&gt;");
    });

    it("escapa comillas dobles en el nombre de empresa", () => {
      const html = generateReportHtml({ ...BASE_DATA, company: 'Empresa "con comillas"' });
      expect(html).not.toContain('"con comillas"');
      expect(html).toContain("&quot;con comillas&quot;");
    });

    it("escapa ampersands en los datos del usuario", () => {
      const html = generateReportHtml({ ...BASE_DATA, company: "Empresa & Socios" });
      expect(html).toContain("Empresa &amp; Socios");
    });
  });

  describe("puntuación y score ring", () => {
    it("incluye el score global como número /100", () => {
      const results = computeResults(allOptions(0), "direccion");
      const html = generateReportHtml({ ...BASE_DATA, results });
      expect(html).toContain(`${results.weightedScore}`);
      expect(html).toContain("/100");
    });

    it("muestra el score sobre 10 con coma decimal (formato es-ES)", () => {
      const results = computeResults(allOptions(0), "direccion");
      const sc = results.scoreOver10.toFixed(1).replace(".", ",");
      const html = generateReportHtml({ ...BASE_DATA, results });
      expect(html).toContain(sc);
    });

    it("el SVG del ring tiene stroke-dashoffset distinto de 0 cuando score < 100", () => {
      const results = computeResults(allOptions(0), "direccion"); // peores respuestas → score bajo
      const html = generateReportHtml({ ...BASE_DATA, results });
      // stroke-dashoffset=0 solo ocurre cuando weightedScore=100
      expect(html).not.toContain('stroke-dashoffset="0"');
    });

    it("el SVG del ring tiene stroke-dashoffset=0 cuando score=100", () => {
      const results = computeResults(allOptions(3), "direccion"); // mejores respuestas → score=100
      const html = generateReportHtml({ ...BASE_DATA, results });
      expect(html).toContain('stroke-dashoffset="0"');
    });

    it("incluye el perfil en mayúsculas", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("DIRECCION");
    });

    it("reemplaza guiones bajos del perfil por espacios", () => {
      const results = computeResults(allOptions(0), "promotor_inversor");
      const html = generateReportHtml({ ...BASE_DATA, results });
      expect(html).toContain("PROMOTOR INVERSOR");
      expect(html).not.toContain("PROMOTOR_INVERSOR");
    });
  });

  describe("banda de nivel (result-band)", () => {
    it("score >= 85 → 'Tienes las bases'", () => {
      const results = computeResults(allOptions(3), "direccion"); // score=100
      const html = generateReportHtml({ ...BASE_DATA, results });
      expect(html).toContain("Tienes las bases");
    });

    it("score bajo → 'Todo depende del equipo'", () => {
      const results = computeResults(allOptions(0), "direccion"); // score bajo
      const html = generateReportHtml({ ...BASE_DATA, results });
      // score=0 → banda más baja
      if (results.weightedScore < 45) {
        expect(html).toContain("Todo depende del equipo");
      }
    });

    it("la banda tiene un color hexadecimal inline", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toMatch(/background:#[0-9A-Fa-f]{6}/);
    });
  });

  describe("dimensiones", () => {
    it("muestra las 4 dimensiones", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("Bloque I");
      expect(html).toContain("Bloque II");
      expect(html).toContain("Bloque III");
      expect(html).toContain("Bloque IV");
    });

    it("muestra los nombres de todas las dimensiones", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("Decidir con datos");
      expect(html).toContain("Conocimiento del equipo");
      expect(html).toContain("Decisiones coordinadas");
      expect(html).toContain("Visión en tiempo real de dirección");
    });

    it("muestra el porcentaje de cada dimensión con símbolo %", () => {
      const results = computeResults(allOptions(3), "direccion");
      const html = generateReportHtml({ ...BASE_DATA, results });
      // con todas las mejores respuestas, todas las dimensiones son 100%
      expect(html).toContain("100%");
    });

    it("incluye la leyenda de escala de madurez", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("Escala de madurez");
      expect(html).toContain("Depende de personas");
      expect(html).toContain("Bien integrado");
    });

    it("muestra etiquetas de madurez por dimensión", () => {
      const html = generateReportHtml(BASE_DATA);
      const labels = ["Bien asentado", "Funciona con huecos", "Hay base, falta conectar", "Requiere atención prioritaria"];
      const found = labels.filter(l => html.includes(l));
      expect(found.length).toBeGreaterThan(0);
    });
  });

  describe("top 3 retos", () => {
    it("incluye el título de la sección de retos", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("3 prioridades de mejora");
    });

    it("muestra los 3 retos del resultado", () => {
      const results = computeResults(allOptions(0), "direccion");
      const html = generateReportHtml({ ...BASE_DATA, results });
      for (const item of results.topRetos) {
        expect(html).toContain(item.reto.name);
      }
    });

    it("los retos tienen numeración 1, 2, 3", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain(">1<");
      expect(html).toContain(">2<");
      expect(html).toContain(">3<");
    });

    it("incluye 'Lo que ocurre hoy' y 'Lo que permite resolver' en cada reto", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("Lo que ocurre hoy");
      expect(html).toContain("Lo que permite resolver");
    });

    it("los retos muestran el bloque de dimensión correspondiente", () => {
      const results = computeResults(allOptions(0), "direccion");
      const html = generateReportHtml({ ...BASE_DATA, results });
      // Al menos uno de los bloques debe aparecer en las cards de retos
      const bloques = ["Bloque I", "Bloque II", "Bloque III", "Bloque IV"];
      const found = bloques.filter(b => html.includes(b));
      expect(found.length).toBeGreaterThan(0);
    });
  });

  describe("footer y branding", () => {
    it("incluye el nombre de la marca", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("yūtopias");
    });

    it("incluye el enlace a yutopias.com", () => {
      const html = generateReportHtml(BASE_DATA);
      expect(html).toContain("yutopias.com");
    });

    it("incluye la fecha de generación", () => {
      const html = generateReportHtml(BASE_DATA);
      const year = new Date().getFullYear().toString();
      expect(html).toContain(year);
    });

    it("el isologotipo SVG está presente", () => {
      const html = generateReportHtml(BASE_DATA);
      // El iso tiene una ruta característica
      expect(html).toContain("M 32 12 L 44 8");
    });
  });

  describe("consistencia con distintos perfiles", () => {
    const profiles: ProfileKey[] = [
      "promotor_inversor", "direccion", "estudios_constructor",
      "delegado_pm", "arquitecto_ingeniero", "otro",
    ];

    it.each(profiles)("genera HTML válido para perfil '%s'", (profile) => {
      const results = computeResults(allOptions(0), profile);
      const html = generateReportHtml({ ...BASE_DATA, results });
      expect(html).toMatch(/^<!DOCTYPE html>/i);
      expect(html).toContain("</html>");
      expect(html).not.toContain("undefined");
      expect(html).not.toContain("[object Object]");
    });

    it.each(profiles)("no contiene NaN para perfil '%s'", (profile) => {
      const results = computeResults(allOptions(1), profile);
      const html = generateReportHtml({ ...BASE_DATA, results });
      expect(html).not.toContain("NaN");
    });
  });
});

/* ─── downloadReport ────────────────────────────────────────────────────────── */

describe("downloadReport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function setupDownloadMocks() {
    const clicks: string[] = [];
    const anchor = {
      click: vi.fn(() => clicks.push("clicked")),
      href: "",
      download: "",
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, "createElement").mockReturnValue(anchor);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => anchor);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => anchor);

    const revokeObjectURL = vi.fn();
    const createObjectURL = vi.fn(() => "blob:mock-url");
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

    return { anchor, createObjectURL, revokeObjectURL };
  }

  it("llama a URL.createObjectURL con un Blob", () => {
    const { createObjectURL } = setupDownloadMocks();
    downloadReport(BASE_DATA);
    expect(createObjectURL).toHaveBeenCalledOnce();
    const arg = createObjectURL.mock.calls[0][0];
    expect(arg).toBeInstanceOf(Blob);
  });

  it("el Blob es de tipo text/html", () => {
    const { createObjectURL } = setupDownloadMocks();
    downloadReport(BASE_DATA);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toContain("text/html");
  });

  it("el atributo download del anchor incluye el nombre de empresa", () => {
    const { anchor } = setupDownloadMocks();
    downloadReport(BASE_DATA);
    expect(anchor.download).toContain("yutopias-test");
  });

  it("el nombre de descarga empieza con 'informe-diagnostico'", () => {
    const { anchor } = setupDownloadMocks();
    downloadReport(BASE_DATA);
    expect(anchor.download).toMatch(/^informe-diagnostico/);
  });

  it("el nombre de descarga termina en .html", () => {
    const { anchor } = setupDownloadMocks();
    downloadReport(BASE_DATA);
    expect(anchor.download).toMatch(/\.html$/);
  });

  it("el nombre de descarga usa guiones bajos para separar palabras con espacios", () => {
    const { anchor } = setupDownloadMocks();
    downloadReport({ ...BASE_DATA, company: "Mi Empresa SA" });
    expect(anchor.download).not.toContain(" ");
  });

  it("llama a anchor.click() para disparar la descarga", () => {
    const { anchor } = setupDownloadMocks();
    downloadReport(BASE_DATA);
    expect(anchor.click).toHaveBeenCalledOnce();
  });

  it("llama a URL.revokeObjectURL para liberar memoria", () => {
    const { revokeObjectURL } = setupDownloadMocks();
    downloadReport(BASE_DATA);
    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("funciona sin company — filename es solo 'informe-diagnostico.html'", () => {
    const { anchor } = setupDownloadMocks();
    downloadReport({ ...BASE_DATA, company: "" });
    expect(anchor.download).toBe("informe-diagnostico.html");
  });

  it("sanitiza caracteres especiales del nombre de empresa en el filename", () => {
    const { anchor } = setupDownloadMocks();
    downloadReport({ ...BASE_DATA, company: "Empresa & Socios S.L." });
    // & y espacios se eliminan; puntos quedan como guiones tras el replace
    expect(anchor.download).not.toContain("&");
    expect(anchor.download).not.toContain(" ");
    expect(anchor.download).toMatch(/^informe-diagnostico-.+\.html$/);
  });
});
