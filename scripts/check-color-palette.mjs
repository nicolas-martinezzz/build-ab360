import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const TARGET_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);
const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;

const ALLOWED_HEX = new Set([
  "#E4F1CF",
  "#C3E195",
  "#9BBF64",
  "#6E9733",
  "#359E52",
  "#127334",
  "#1C1E2E",
  "#7B7C82",
  "#D7D7D7",
  "#FFFFFF",
  "#000000",
]);

const toUpperHex = (value) => value.toUpperCase();

const readDirRecursive = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readDirRecursive(fullPath));
      continue;
    }

    const extension = path.extname(entry.name);
    if (TARGET_EXTENSIONS.has(extension)) {
      files.push(fullPath);
    }
  }

  return files;
};

const checkFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const errors = [];
  const relativePath = path.relative(ROOT, filePath).replaceAll("\\", "/");

  for (const match of content.matchAll(HEX_REGEX)) {
    const rawHex = match[0];
    const normalizedHex = toUpperHex(rawHex);
    if (ALLOWED_HEX.has(normalizedHex)) {
      continue;
    }

    const matchIndex = match.index ?? 0;
    const before = content.slice(0, matchIndex);
    const line = before.split("\n").length;
    errors.push(`${relativePath}:${line} -> ${rawHex}`);
  }

  return errors;
};

const files = readDirRecursive(SRC_DIR);
const violations = files.flatMap(checkFile);

if (violations.length > 0) {
  console.error("Palette check failed. Found color values outside the approved palette:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Palette check passed.");
