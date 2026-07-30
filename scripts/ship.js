#!/usr/bin/env node
/**
 * ship.js — verify, build, and deploy main to production.
 * Usage: node scripts/ship.js
 *
 * Refuses to deploy from a dirty or out-of-sync working tree, so what reaches
 * production always matches a pushed commit on main.
 */

const { execSync } = require("child_process");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const ROOT = path.resolve(__dirname, "..");
const DEPLOY_BRANCH = process.env.DEPLOY_BRANCH || "main";

function run(cmd, label) {
    console.log(`\n▶ ${label}`);
    execSync(cmd, { stdio: "inherit", cwd: ROOT });
}

function capture(cmd) {
    return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

function fail(message, hint) {
    console.error(`\n❌ ${message}`);
    if (hint) console.error(`   ${hint}`);
    process.exit(1);
}

function preflight() {
    console.log("▶ Comprobaciones previas");

    const branch = capture("git rev-parse --abbrev-ref HEAD");
    if (branch !== DEPLOY_BRANCH) {
        fail(
            `Estás en '${branch}' y el deploy se hace desde '${DEPLOY_BRANCH}'.`,
            `Ejecuta: git checkout ${DEPLOY_BRANCH}`
        );
    }

    if (capture("git status --porcelain")) {
        fail(
            "Hay cambios sin commitear.",
            "Commitea o descarta los cambios antes de desplegar."
        );
    }

    run(`git fetch origin ${DEPLOY_BRANCH}`, "Sincronizando referencias remotas");

    const [behind, ahead] = capture(
        `git rev-list --left-right --count origin/${DEPLOY_BRANCH}...${DEPLOY_BRANCH}`
    ).split(/\s+/);

    if (behind !== "0") {
        fail(
            `'${DEPLOY_BRANCH}' está ${behind} commit(s) por detrás de origin.`,
            `Ejecuta: git pull origin ${DEPLOY_BRANCH}`
        );
    }
    if (ahead !== "0") {
        fail(
            `'${DEPLOY_BRANCH}' tiene ${ahead} commit(s) sin pushear.`,
            `Ejecuta: git push origin ${DEPLOY_BRANCH}`
        );
    }

    console.log(`  ✓ ${DEPLOY_BRANCH} limpio y sincronizado con origin`);
}

async function ship() {
    console.log("🚢 Iniciando ship a producción...\n");

    preflight();
    run("npm run verify", "Verificando el proyecto (lint, tests, build)");
    run("node scripts/deploy-production.js", "Desplegando a producción");

    console.log("\n✅ Ship completado.");
    console.log(`   📦 GitHub: ${DEPLOY_BRANCH} @ ${capture("git rev-parse --short HEAD")}`);
}

ship().catch((err) => {
    console.error("\n❌ Ship fallido:", err.message);
    process.exit(1);
});
