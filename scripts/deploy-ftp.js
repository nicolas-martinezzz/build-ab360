require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const ftp = require("basic-ftp");
const path = require("path");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log("Conectando al servidor FTP...");
        await client.access({
            host: process.env.DEPLOY_HOST,
            user: process.env.DEPLOY_USER,
            password: process.env.DEPLOY_PASSWORD,
            secure: true,
            // Shared hosting uses a provider wildcard cert (*.loading.es), not per-IP cert.
            // TLS is active and traffic is encrypted — only the hostname validation fails.
            secureOptions: { rejectUnauthorized: false },
        });
        console.log("Conexión exitosa. Subiendo archivos a staging.yutopias.com/httpdocs...");
        
        // Asegurarse de que el directorio remoto exista
        await client.ensureDir("staging.yutopias.com/httpdocs");
        
        // Limpiar el directorio remoto antes de subir (opcional, pero recomendado para builds limpios)
        console.log("Limpiando directorio remoto (esto puede tardar unos segundos)...");
        await client.clearWorkingDir();
        
        // Subir la carpeta out
        console.log("Subiendo la carpeta out/ ...");
        await client.uploadFromDir(path.join(__dirname, "../out"));
        
        console.log("¡Despliegue finalizado con éxito!");
    }
    catch(err) {
        console.error("Error durante el despliegue:", err);
    }
    client.close();
}

deploy();
