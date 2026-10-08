<?php
declare(strict_types=1);

/**
 * forgot-password.php — solicitud de enlace para restablecer la contraseña del
 * panel admin.
 *
 * Reglas de seguridad que este archivo DEBE mantener:
 *   - Sin enumeración de usuarios: la respuesta es siempre el mismo mensaje
 *     genérico, exista o no la cuenta, y con un piso de duración para que el
 *     tiempo tampoco delate nada.
 *   - El token viaja SÓLO en el email. En la DB se guarda únicamente su
 *     sha256; nunca se escribe el token en un error_log ni en la respuesta.
 *   - Todas las consultas van con prepared statements.
 *
 * Ver odd/tasks/admin-password-recovery.md.
 */

// El modo local (centinela `.local` + auth.local.php) usa SQLite y no tiene las
// tablas admin_users / admin_password_resets. En vez de reventar con un fatal
// error, el flujo se declara no disponible. Mantiene intacto el mecanismo que
// usa index.php.
$localSentinel = __DIR__ . "/.local";
$localAuth     = __DIR__ . "/auth.local.php";
$isLocalMode   = file_exists($localSentinel);
require_once ($isLocalMode && is_file($localAuth)) ? $localAuth : __DIR__ . "/auth.php";

startSecureSession();

// Mensaje único para TODOS los finales del camino felizmente-ambiguo: cuenta
// existente, cuenta inexistente, límite horario alcanzado o fallo de envío.
const FORGOT_GENERIC_NOTICE =
    "Si el email corresponde a una cuenta, te enviamos un enlace para restablecer la contraseña.";

// Máximo de solicitudes por hora para una misma cuenta Y un mismo solicitante
// (se cuentan filas en admin_password_resets). Ver la nota sobre el alcance del
// límite más abajo, en el bloque del POST.
const FORGOT_MAX_PER_EMAIL_PER_HOUR = 3;

// Vigencia del token.
const FORGOT_TOKEN_TTL_MINUTES = 30;

// Piso de duración del POST, en segundos. Absorbe la diferencia entre "cuenta
// existe → INSERT + SMTP" y "cuenta no existe → sólo SELECT".
const FORGOT_MIN_POST_SECONDS = 0.6;

$error      = "";
$notice     = "";
$emailValue = "";

/**
 * Envía el email con el enlace. Devuelve false si falló (yutopias_mail nunca
 * lanza). El token sólo aparece aquí, dentro del cuerpo del mensaje.
 */
function adminSendResetEmail(array $config, string $email, string $token): bool {
    $configPath = getenv("NEWSLETTER_CONFIG_FILE")
        ?: dirname(dirname(__DIR__)) . "/private/newsletter-config.php";
    $mailerPath = dirname($configPath) . "/smtp_mailer.php";
    if (!is_file($mailerPath)) {
        error_log("[admin-forgot] smtp_mailer.php no encontrado en " . $mailerPath);
        return false;
    }
    require_once $mailerPath;
    if (!function_exists("yutopias_mail")) {
        error_log("[admin-forgot] yutopias_mail() no está definida");
        return false;
    }

    $mailFrom  = adminMailFrom($config);
    $resetUrl  = adminBaseUrl($config) . "/reset-password.php?token=" . rawurlencode($token);
    $resetHtml = htmlspecialchars($resetUrl, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");

    // smtp_mailer.php interpola $to y $subject directamente en las cabeceras:
    // sin saltos de línea, y el asunto codificado en RFC 2047.
    $recipient = (string)preg_replace('/[\r\n]+/', "", $email);
    $subject   = "=?UTF-8?B?" . base64_encode("Restablecer tu contraseña · Panel yūtopias") . "?=";

    $body = '<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:24px;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <div style="max-width:560px;margin:0 auto;background-color:#ffffff;padding:32px;border-radius:8px;">
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;">Restablecer tu contrase&ntilde;a</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
        Recibimos una solicitud para restablecer la contrase&ntilde;a de tu cuenta del panel de
        administraci&oacute;n de y&#363;topias.
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
        Para elegir una contrase&ntilde;a nueva, abr&iacute; este enlace:
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;word-break:break-all;">
        <a href="' . $resetHtml . '" style="color:#127334;">' . $resetHtml . '</a>
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4a4a4a;">
        El enlace caduca en ' . (int)FORGOT_TOKEN_TTL_MINUTES . ' minutos y sirve una sola vez.
      </p>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4a4a4a;">
        Si no solicitaste este cambio, pod&eacute;s ignorar este mensaje: tu contrase&ntilde;a actual
        sigue siendo v&aacute;lida.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;">
        El equipo de y&#363;topias systems
      </p>
    </div>
  </body>
</html>';

    $headers = implode("\r\n", [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "From: =?UTF-8?B?" . base64_encode("yūtopias systems") . "?= <{$mailFrom}>",
        "Reply-To: {$mailFrom}",
    ]);

    return yutopias_mail($recipient, $subject, $body, $headers);
}

if (!$isLocalMode && $_SERVER["REQUEST_METHOD"] === "POST") {
    $startedAt = microtime(true);
    $ip        = (string)($_SERVER["REMOTE_ADDR"] ?? "unknown");
    $email     = adminNormalizeEmail((string)($_POST["email"] ?? ""));
    $csrf      = (string)($_POST["csrf_token"] ?? "");

    // Se refleja en el formulario; la salida va siempre por htmlspecialchars.
    $emailValue = $email;

    if (!verifyCsrf($csrf)) {
        $error = "Sesión inválida. Recargá la página.";
    } elseif (!checkRateLimit($ip)) {
        $error = "Demasiados intentos. Esperá 15 minutos.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
        // Error de formato, no de existencia: no revela nada sobre la cuenta.
        $error = "Ingresá un email válido.";
    } else {
        // Desde aquí la respuesta es SIEMPRE la misma, pase lo que pase.
        $notice     = FORGOT_GENERIC_NOTICE;
        $emailValue = "";

        try {
            $pdo = getDb($config);

            if (adminUserExists($pdo, $email)) {
                // ── Alcance del límite y de la invalidación ──────────────────
                // Antes el límite se contaba por email OBJETIVO sin importar
                // quién pedía, y cada solicitud nueva mataba los tokens vivos
                // de esa cuenta. Tres POST por hora contra la cuenta del admin
                // bastaban para dejarlo sin poder recibir ningún enlace, en
                // silencio y de forma indefinida.
                //
                // Las dos mitades del abuso se cierran por separado, y hacen
                // falta las dos: contar por solicitante evita que un tercero
                // consuma la cuota del admin, y no invalidar los tokens de
                // otros solicitantes evita que le mate el enlace que ya
                // recibió. Con sólo una de las dos el bloqueo sigue siendo
                // posible (consumir la cuota antes, o invalidar después).
                //
                // La identidad del solicitante es el ip_hash que ya se guarda.
                // Si no hay `ip_salt` configurado es null y no se puede
                // distinguir a nadie: ahí se cuenta por email, como antes
                // (degradación conservadora: mantiene un techo), y la
                // invalidación no alcanza a nadie.
                $ipHash = adminIpHash($config, (string)($_SERVER["REMOTE_ADDR"] ?? ""));

                $countSql = "SELECT COUNT(*) FROM admin_password_resets
                              WHERE email = :email
                                AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)";
                $countParams = [":email" => $email];
                if ($ipHash !== null) {
                    $countSql .= " AND ip_hash = :ip_hash";
                    $countParams[":ip_hash"] = $ipHash;
                }
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute($countParams);
                $recentRequests = (int)$countStmt->fetchColumn();

                if ($recentRequests >= FORGOT_MAX_PER_EMAIL_PER_HOUR) {
                    // Silencioso a propósito: el usuario ve el mismo mensaje.
                    error_log("[admin-forgot] límite horario de solicitudes alcanzado para " . $email);
                } else {
                    $token     = bin2hex(random_bytes(32));
                    $tokenHash = hash("sha256", $token);

                    $pdo->beginTransaction();
                    try {
                        // Pedir un enlace nuevo invalida los anteriores DEL
                        // MISMO SOLICITANTE, no los de la cuenta entera: así
                        // una solicitud ajena no mata el enlace que el admin ya
                        // tiene en su bandeja. Pueden convivir varios enlaces
                        // vigentes por cuenta; siguen siendo de un solo uso y
                        // con TTL, y el techo por solicitante los limita a
                        // FORGOT_MAX_PER_EMAIL_PER_HOUR dentro de la ventana.
                        if ($ipHash !== null) {
                            $invalidate = $pdo->prepare(
                                "UPDATE admin_password_resets
                                    SET used_at = NOW()
                                  WHERE email = :email
                                    AND ip_hash = :ip_hash
                                    AND used_at IS NULL"
                            );
                            $invalidate->execute([
                                ":email"   => $email,
                                ":ip_hash" => $ipHash,
                            ]);
                        }

                        $insert = $pdo->prepare(
                            "INSERT INTO admin_password_resets (email, token_hash, expires_at, ip_hash)
                             VALUES (:email, :token_hash, DATE_ADD(NOW(), INTERVAL "
                             . (int)FORGOT_TOKEN_TTL_MINUTES . " MINUTE), :ip_hash)"
                        );
                        $insert->execute([
                            ":email"      => $email,
                            ":token_hash" => $tokenHash,
                            ":ip_hash"    => $ipHash,
                        ]);

                        $pdo->commit();
                    } catch (Throwable $txError) {
                        if ($pdo->inTransaction()) $pdo->rollBack();
                        throw $txError;
                    }

                    if (!adminSendResetEmail($config, $email, $token)) {
                        // Nunca se registra el token, sólo el destinatario.
                        error_log("[admin-forgot] falló el envío del email de recuperación a " . $email);
                    }
                }
            }
        } catch (Throwable $unexpected) {
            // Ni un stack trace ni un mensaje distinto llegan al navegador.
            error_log("[admin-forgot] error inesperado: " . $unexpected->getMessage());
        }

        // Piso de duración: iguala el camino "cuenta existe" (INSERT + SMTP) con
        // el camino "cuenta no existe" (sólo SELECT).
        $elapsed = microtime(true) - $startedAt;
        if ($elapsed < FORGOT_MIN_POST_SECONDS) {
            usleep((int)round((FORGOT_MIN_POST_SECONDS - $elapsed) * 1000000));
        }
    }
}

$csrfToken = csrfToken();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Recuperar contraseña · Admin Yutopias</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0D1117;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .card {
      background: #161B22;
      border: 1px solid #30363D;
      border-radius: 12px;
      padding: 40px 36px;
      width: 100%;
      max-width: 400px;
    }
    .logo {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 0.04em;
    }
    .logo-text span { color: #4CAF50; }
    .subtitle {
      font-size: 13px;
      color: #8B949E;
      text-align: center;
      margin-top: 4px;
    }
    h2 {
      font-size: 16px;
      font-weight: 600;
      color: #E6EDF3;
      margin-bottom: 8px;
      text-align: center;
    }
    .intro {
      font-size: 13px;
      color: #8B949E;
      line-height: 1.5;
      margin-bottom: 20px;
      text-align: center;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #C9D1D9;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 10px 14px;
      background: #0D1117;
      border: 1px solid #30363D;
      border-radius: 6px;
      color: #E6EDF3;
      font-size: 14px;
      outline: none;
      transition: border-color .15s;
    }
    input:focus { border-color: #4CAF50; }
    .field { margin-bottom: 16px; }
    .btn {
      width: 100%;
      padding: 10px;
      background: #127334;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background .15s;
      margin-top: 4px;
    }
    .btn:hover { background: #0f5e2b; }
    .error {
      background: #3D1A1A;
      border: 1px solid #6B2020;
      color: #F97583;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .notice {
      background: #12241A;
      border: 1px solid #1F5134;
      color: #7EE2A8;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .alt-link {
      margin-top: 18px;
      text-align: center;
      font-size: 13px;
    }
    .alt-link a {
      color: #8B949E;
      text-decoration: none;
      transition: color .15s;
    }
    .alt-link a:hover { color: #4CAF50; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-text">YUTO<span>PIAS</span></div>
      <div class="subtitle">Panel de Administración</div>
    </div>

<?php if ($isLocalMode): ?>
    <h2>Recuperar contraseña</h2>
    <div class="notice">
      La recuperación de contraseña no está disponible en modo local: necesita las
      tablas <code>admin_users</code> y <code>admin_password_resets</code> de MySQL.
      En modo local el panel entra con auto-login.
    </div>
<?php else: ?>
    <h2>Recuperar contraseña</h2>
    <p class="intro">
      Escribí el email de tu cuenta y te enviamos un enlace para elegir una contraseña nueva.
    </p>

    <?php if ($error): ?>
      <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, "UTF-8") ?></div>
    <?php endif; ?>

    <?php if ($notice): ?>
      <div class="notice"><?= htmlspecialchars($notice, ENT_QUOTES, "UTF-8") ?></div>
    <?php endif; ?>

    <form method="POST" autocomplete="off">
      <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, "UTF-8") ?>">

      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" maxlength="255"
               value="<?= htmlspecialchars($emailValue, ENT_QUOTES, "UTF-8") ?>"
               required autofocus placeholder="admin@yutopias.com">
      </div>

      <button type="submit" class="btn">Enviar enlace</button>
    </form>
<?php endif; ?>

    <div class="alt-link">
      <a href="login.php">Volver al login</a>
    </div>
  </div>
</body>
</html>
