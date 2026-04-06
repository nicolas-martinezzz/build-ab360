import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const targetDirs = ["src/messages"];

const listJsonFiles = (dirPath) => {
  const entries = readdirSync(dirPath);
  return entries.flatMap((entry) => {
    const absolutePath = join(dirPath, entry);
    const entryStat = statSync(absolutePath);

    if (entryStat.isDirectory()) {
      return listJsonFiles(absolutePath);
    }

    if (absolutePath.endsWith(".json")) {
      return [absolutePath];
    }

    return [];
  });
};

const jsonFiles = targetDirs.flatMap((relativeDir) => listJsonFiles(join(projectRoot, relativeDir)));
const filesWithBom = jsonFiles.filter((filePath) => {
  const fileContent = readFileSync(filePath, "utf8");
  return fileContent.charCodeAt(0) === 0xfeff;
});

if (filesWithBom.length > 0) {
  console.error("Found UTF-8 BOM in JSON files:");
  filesWithBom.forEach((filePath) => {
    console.error(`- ${filePath}`);
  });
  console.error("Save these files as UTF-8 without BOM and retry.");
  process.exit(1);
}

console.log(`JSON BOM check passed (${jsonFiles.length} files).`);
