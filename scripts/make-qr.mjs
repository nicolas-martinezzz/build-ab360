/**
 * Generates a high-resolution PNG QR code, locally — the URL is never sent to
 * any third-party QR service.
 *
 * Usage:
 *   node scripts/make-qr.mjs <url> [output.png] [pixels]
 *
 * Example (Bootcamp Zero challenges landing):
 *   node scripts/make-qr.mjs https://yutopias.com/es/bootcamp-retos/ qr/bootcamp-retos.png 2400
 *
 * Error correction is set to "H" (~30% recoverable) so the code still scans
 * when it is printed small, reproduced on a slide, or partially obscured.
 */
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import QRCode from "qrcode";

const [url, output = "qr/codigo.png", sizeArg = "2400"] = process.argv.slice(2);

if (!url) {
  console.error("Falta la URL.\nUso: node scripts/make-qr.mjs <url> [salida.png] [pixeles]");
  process.exit(1);
}

try {
  // Reject anything that is not an absolute http(s) URL: a relative path would
  // produce a QR that scans into nothing useful.
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("protocolo no soportado");
  }
} catch {
  console.error(`URL no válida: ${url}`);
  process.exit(1);
}

const size = Number.parseInt(sizeArg, 10);
if (!Number.isFinite(size) || size < 300 || size > 8000) {
  console.error(`Tamaño no válido: ${sizeArg} (usa entre 300 y 8000)`);
  process.exit(1);
}

await mkdir(dirname(output), { recursive: true });

await QRCode.toFile(output, url, {
  type: "png",
  errorCorrectionLevel: "H",
  width: size,
  margin: 4,
  color: { dark: "#1C1E2EFF", light: "#FFFFFFFF" },
});

console.log(`QR generado: ${output}`);
console.log(`  URL:     ${url}`);
console.log(`  Tamaño:  ${size}x${size} px`);
console.log(`  Nivel:   H (30% de recuperación)`);
