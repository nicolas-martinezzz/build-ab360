require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

// Upload directory contents recursively, skipping the /api subfolder
async function uploadDirExcludingApi(client, localDir) {
    const entries = fs.readdirSync(localDir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (entry.name === "api") continue;
            await client.ensureDir(entry.name);
            await client.cd(entry.name);
            await uploadDirExcludingApi(client, path.join(localDir, entry.name));
            await client.cd("..");
        } else {
            await client.uploadFrom(path.join(localDir, entry.name), entry.name);
        }
    }
}

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
        console.log("🚀 Conectando al servidor FTP (STAGING)...");
        await client.access({
            host: process.env.DEPLOY_HOST,
            user: process.env.DEPLOY_USER,
            password: process.env.DEPLOY_PASSWORD,
            secure: true,
            // Shared hosting uses a provider wildcard cert (*.loading.es), not per-IP cert.
            // TLS is active and traffic is encrypted — only the hostname validation fails.
            secureOptions: { rejectUnauthorized: false },
        });
        console.log("✓ Conectado\n");

        console.log("📦 Subiendo build estático (sin api/)...");
        await client.ensureDir("staging.yutopias.com/httpdocs");
        await client.cd("staging.yutopias.com/httpdocs");
        await client.clearWorkingDir();
        await uploadDirExcludingApi(client, path.join(__dirname, "../out"));
        console.log("  ✓ build estático subido\n");

        console.log("🔌 Subiendo API PHP...");
        await client.ensureDir("api");
        await client.cd("api");
        const phpFiles = ["diagnostic.php", "newsletter.php", "bootcamp-lead.php"];
        for (const f of phpFiles) {
            await client.uploadFrom(path.join(__dirname, "../public/api", f), f);
            console.log("  ✓ api/" + f);
        }

        console.log("\n✅ ¡Despliegue a STAGING finalizado con éxito!");
        console.log("   🌐 https://staging.yutopias.com");
    } catch (err) {
        console.error("\n❌ Error durante el despliegue:", err.message);
    }
    client.close();
}

deploy();
