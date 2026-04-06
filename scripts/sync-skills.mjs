import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, ".agents", "skills");
const to = join(root, ".cursor", "skills");

if (!existsSync(from)) {
  console.warn("Missing .agents/skills — run npm run skills:install first.");
  process.exit(0);
}

mkdirSync(to, { recursive: true });

for (const name of readdirSync(from)) {
  const src = join(from, name);
  if (statSync(src).isDirectory()) {
    cpSync(src, join(to, name), { recursive: true });
  }
}

console.log("Synced marketplace skills into .cursor/skills");
