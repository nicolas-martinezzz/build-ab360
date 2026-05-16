#!/usr/bin/env node
/**
 * ship.js — merge develop → main, push to GitHub, build, and deploy to production.
 * Usage: node scripts/ship.js
 */

const { execSync } = require("child_process");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

function run(cmd, label) {
    console.log(`\n▶ ${label}`);
    execSync(cmd, { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
}

async function ship() {
    console.log("🚢 Iniciando ship a producción...\n");

    // 1. Asegurarse de estar en develop y que esté limpio
    run("git checkout develop", "Cambiando a develop");
    run("git pull origin develop", "Sincronizando develop con remote");

    // 2. Merge develop → main
    run("git checkout main", "Cambiando a main");
    run("git pull origin main", "Sincronizando main con remote");
    run("git merge develop --no-edit", "Mergeando develop → main");

    // 3. Push main a GitHub
    run("git push origin main", "Pusheando main a GitHub");

    // 4. Volver a develop
    run("git checkout develop", "Volviendo a develop");

    // 5. Build
    run("npm run build", "Buildeando el proyecto");

    // 6. Deploy FTP
    run("node scripts/deploy-production.js", "Deployando a producción (FTP)");

    console.log("\n✅ Ship completado.");
    console.log("   🌐 https://yutopias.com");
    console.log("   🔐 https://admin.yutopias.com");
    console.log("   📦 GitHub: main actualizado");
}

ship().catch((err) => {
    console.error("\n❌ Ship fallido:", err.message);
    process.exit(1);
});
