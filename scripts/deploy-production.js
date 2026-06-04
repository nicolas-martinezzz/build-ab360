require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const ftp  = require("basic-ftp");
const ssh2 = require("ssh2");
const path = require("path");
const fs   = require("fs");
const os   = require("os");
const crypto = require("crypto");

// ─── SSH config ────────────────────────────────────────────────────────────────
const SSH_CONFIG = {
    host:       "185.47.247.175",
    port:       2222,
    username:   "nico",
    privateKey: fs.readFileSync(path.join(os.homedir(), ".ssh", "id_ed25519")),
};

// ─── FTP config (only used for /private outside webroot) ───────────────────────
async function ftpConnect() {
    const c = new ftp.Client();
    c.ftp.verbose = false;
    c.ftp.timeout = 120000;
    await c.access({
        host:           SSH_CONFIG.host,
        user:           SSH_CONFIG.username,
        password:       process.env.DEPLOY_PASSWORD,
        secure:         true,
        secureOptions:  { rejectUnauthorized: false },
    });
    return c;
}

// ─── SSH helpers ───────────────────────────────────────────────────────────────
function openSSH() {
    return new Promise((resolve, reject) => {
        const conn = new ssh2.Client();
        conn.on("ready", () => resolve(conn))
            .on("error", reject)
            .connect(SSH_CONFIG);
    });
}

function exec(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let out = "", err2 = "";
            stream.on("data", d => (out += d));
            stream.stderr.on("data", d => (err2 += d));
            stream.on("close", (code) => {
                if (code !== 0) reject(new Error(`cmd failed (${code}): ${err2 || cmd}`));
                else resolve(out.trim());
            });
        });
    });
}

function openSFTP(conn) {
    return new Promise((resolve, reject) => conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp)));
}

function md5File(p) {
    return crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");
}

// ─── SFTP sync ─────────────────────────────────────────────────────────────────
// Mirrors localDir → remoteDir:
//   - uploads new or changed files (by size+mtime, falls back to md5 on mismatch)
//   - deletes remote files/dirs not present locally
//   - skip set: top-level dir names to leave untouched on the remote
async function syncDir(sftp, conn, localDir, remoteDir, skip = new Set()) {
    let uploaded = 0, deleted = 0, skipped = 0;

    // Ensure remote dir exists
    async function ensureDir(rPath) {
        try { await sftp.mkdir(rPath); } catch (_) {}
    }

    // List remote entries, returns Map<name, attrs>
    async function remoteList(rPath) {
        return new Promise((resolve, reject) => {
            sftp.readdir(rPath, (err, list) => {
                if (err) resolve(new Map());
                else resolve(new Map(list.map(e => [e.filename, e.attrs])));
            });
        });
    }

    async function walk(lDir, rDir) {
        await ensureDir(rDir);
        const localEntries  = fs.readdirSync(lDir, { withFileTypes: true });
        const localNames    = new Set(localEntries.map(e => e.name));
        const remoteEntries = await remoteList(rDir);

        // Delete remote entries no longer in local
        for (const [name] of remoteEntries) {
            if (skip.has(name)) continue;
            if (!localNames.has(name)) {
                const rPath = `${rDir}/${name}`;
                try {
                    // Try rmdir first (dir), then unlink (file)
                    await exec(conn, `rm -rf "${rPath}"`);
                    deleted++;
                } catch (_) {}
            }
        }

        // Upload new / changed local entries
        for (const entry of localEntries) {
            if (skip.has(entry.name)) { skipped++; continue; }
            const lPath = path.join(lDir, entry.name);
            const rPath = `${rDir}/${entry.name}`;

            if (entry.isDirectory()) {
                await walk(lPath, rPath);
            } else {
                const rAttrs = remoteEntries.get(entry.name);
                const lStat  = fs.statSync(lPath);

                let needsUpload = true;
                if (rAttrs) {
                    // Quick check: same size AND mtime within 2s → probably same
                    if (rAttrs.size === lStat.size && Math.abs(rAttrs.mtime - lStat.mtimeMs / 1000) < 2) {
                        needsUpload = false;
                        skipped++;
                    } else if (rAttrs.size === lStat.size) {
                        // Same size but different mtime — compare md5 to be sure
                        const localHash = md5File(lPath);
                        const remoteHash = await exec(conn, `md5sum "${rPath}" | cut -d' ' -f1`).catch(() => "");
                        if (localHash === remoteHash) {
                            needsUpload = false;
                            skipped++;
                        }
                    }
                }

                if (needsUpload) {
                    await new Promise((resolve, reject) =>
                        sftp.fastPut(lPath, rPath, err => err ? reject(err) : resolve())
                    );
                    uploaded++;
                }
            }
        }
    }

    await walk(localDir, remoteDir);
    return { uploaded, deleted, skipped };
}

// ─── PHP config ────────────────────────────────────────────────────────────────
function buildPhpConfig() {
    return `<?php
// Production config — auto-generated by deploy-production.js
// Stored outside webroot: yutopias.com/private/newsletter-config.php
return [
    "db_host"     => "${process.env.PROD_DB_HOST}",
    "db_port"     => ${process.env.PROD_DB_PORT || 3306},
    "db_name"     => "${process.env.PROD_DB_NAME}",
    "db_user"     => "${process.env.PROD_DB_USER}",
    "db_password" => "${process.env.PROD_DB_PASSWORD}",
    "ip_salt"     => "${process.env.PROD_IP_SALT}",
    "notify_to"   => "${process.env.NEWSLETTER_NOTIFY_TO}",
    "mail_from"   => "${process.env.NEWSLETTER_MAIL_FROM}",
    "app_env"     => "production",
    "notify_to_prod"    => "${process.env.NOTIFY_TO_PROD}",
    "notify_to_staging" => "${process.env.NOTIFY_TO_STAGING}",
    "export_api_key"    => "${process.env.EXPORT_API_KEY}",
];
`;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function deploy() {
    const outDir    = path.resolve(__dirname, "../out");
    const publicDir = path.resolve(__dirname, "../public");

    console.log("🚀 Desplegando a PRODUCCIÓN — yutopias.com\n");

    // 1. PHP config outside webroot via FTP (SSH can't reach /private above httpdocs in chroot)
    console.log("📁 Subiendo config PHP fuera del webroot...");
    const tmpConfig = path.join(os.tmpdir(), "newsletter-config.php");
    fs.writeFileSync(tmpConfig, buildPhpConfig());
    const ftpClient = await ftpConnect();
    try {
        await ftpClient.cd("/");
        try { await ftpClient.send("MKD private"); } catch (_) {}
        await ftpClient.cd("private");
        await ftpClient.uploadFrom(tmpConfig, "newsletter-config.php");
    } finally {
        ftpClient.close();
        fs.unlinkSync(tmpConfig);
    }
    console.log("  ✓ /private/newsletter-config.php\n");

    // 2–5. Everything else via SFTP over SSH
    const conn = await openSSH();
    const sftp = await openSFTP(conn);

    try {
        // 2. Static build — full sync with delete
        console.log("📦 Sincronizando build estático (SFTP)...");
        const stats = await syncDir(sftp, conn, outDir, "httpdocs", new Set(["api", "pdfs", "admin"]));
        console.log(`  ✓ ${stats.uploaded} subidos, ${stats.deleted} eliminados, ${stats.skipped} sin cambios\n`);

        // 3. PHP API files
        console.log("🔌 Subiendo API PHP...");
        const phpFiles = ["diagnostic.php", "newsletter.php", "bootcamp-lead.php", "export.php", "reserva-plaza.php", "ebook-lead.php", "openlab-contact.php"];
        await exec(conn, "mkdir -p ~/httpdocs/api");
        for (const f of phpFiles) {
            const local = path.join(publicDir, "api", f);
            await new Promise((resolve, reject) =>
                sftp.fastPut(local, `httpdocs/api/${f}`, err => err ? reject(err) : resolve())
            );
            console.log(`  ✓ api/${f}`);
        }

        // 4. PDFs (no delete — preserve files uploaded outside this repo)
        const pdfsLocal = path.join(publicDir, "pdfs");
        if (fs.existsSync(pdfsLocal) && fs.readdirSync(pdfsLocal).some(f => f !== ".gitkeep")) {
            console.log("\n📄 Subiendo PDFs...");
            await exec(conn, "mkdir -p ~/httpdocs/pdfs");
            const pdfEntries = fs.readdirSync(pdfsLocal, { withFileTypes: true });
            for (const entry of pdfEntries) {
                if (!entry.isDirectory() && entry.name !== ".gitkeep") {
                    const local = path.join(pdfsLocal, entry.name);
                    await new Promise((resolve, reject) =>
                        sftp.fastPut(local, `httpdocs/pdfs/${entry.name}`, err => err ? reject(err) : resolve())
                    );
                    console.log(`  ✓ pdfs/${entry.name}`);
                }
            }
        }

        // 5. Admin panel
        console.log("\n🔐 Subiendo panel de admin...");
        await exec(conn, "mkdir -p ~/admin.yutopias.com/httpdocs");
        const adminFiles = ["index.php", "login.php", "logout.php", "api.php", "export.php", "auth.php", ".htaccess"];
        for (const f of adminFiles) {
            const local = path.join(publicDir, "admin", f);
            await new Promise((resolve, reject) =>
                sftp.fastPut(local, `admin.yutopias.com/httpdocs/${f}`, err => err ? reject(err) : resolve())
            );
            console.log(`  ✓ admin/${f}`);
        }

    } finally {
        conn.end();
    }

    console.log("\n✅ ¡Despliegue a PRODUCCIÓN finalizado con éxito!");
    console.log("   🌐 https://yutopias.com");
    console.log("   🔐 https://admin.yutopias.com");
}

deploy().catch((err) => {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
});
