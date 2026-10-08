<?php
declare(strict_types=1);

/**
 * reset-password.php — fija una contraseña nueva a partir de un token de
 * recuperación emitido por forgot-password.php.
 *
 * Reglas de seguridad que este archivo DEBE mantener:
 *   - El token del POST se revalida contra la DB; nunca se confía en que el GET
 *     anterior ya lo validó.
 *   - Un token sirve una sola vez: el UPDATE de la contraseña, el marcado de
 *     `used_at` y la invalidación del resto de tokens de esa cuenta ocurren en
 *     una única transacción, con SELECT ... FOR UPDATE para cerrar la carrera
 *     entre dos POST simultáneos con el mismo token.
 *   - Token inválido, caducado o ya usado comparten un único mensaje genérico.
 *   - Todas las consultas van con prepared statements.
 *
 * Ver odd/tasks/admin-password-recovery.md.
 */

// Igual que forgot-password.php: el modo local usa SQLite y no tiene las tablas
// admin_users / admin_password_resets, así que el flujo se declara no disponible
// en vez de reventar.
$localSentinel = __DIR__ . "/.local";
$localAuth     = __DIR__ . "/auth.local.php";
$isLocalMode   = file_exists($localSentinel);
require_once ($isLocalMode && is_file($localAuth)) ? $localAuth : __DIR__ . "/auth.php";

startSecureSession();

// Mensaje único para token ausente, mal formado, inexistente, caducado o usado.
const RESET_GENERIC_INVALID =
    "El enlace no es válido o ya caducó. Pedí uno nuevo para continuar.";

// Longitud mínima de la contraseña nueva, en caracteres.
const RESET_MIN_PASSWORD_LENGTH = 12;

// bcrypt sólo considera los primeros 72 bytes: rechazamos explícitamente los
// más largos en vez de truncarlos en silencio.
const RESET_MAX_PASSWORD_BYTES = 72;

$error      = "";
$tokenValid = false;
$token      = "";

/**
 * Longitud en caracteres, con mbstring si está disponible.
 */
function resetPasswordLength(string $value): int {
    return function_exists("mb_strlen") ? mb_strlen($value, "UTF-8") : strlen($value);
}

/**
 * Busca un token vigente. Devuelve la fila o null.
 *
 * `$forUpdate` toma el lock de fila dentro de la transacción del POST para que
 * dos envíos simultáneos no puedan usar el mismo token dos veces.
 */
function resetFindToken(PDO $pdo, string $tokenHash, bool $forUpdate = false): ?array {
    $sql = "SELECT id, email, token_hash
              FROM admin_password_resets
             WHERE token_hash = :token_hash
               AND used_at IS NULL
               AND expires_at > NOW()
             LIMIT 1";
    if ($forUpdate) $sql .= " FOR UPDATE";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([":token_hash" => $tokenHash]);
    $row = $stmt->fetch();
    if (!is_array($row)) return null;

    // Confirmación en tiempo constante de que la fila recuperada corresponde
    // exactamente al token presentado.
    if (!hash_equals((string)$row["token_hash"], $tokenHash)) return null;

    return $row;
}

if (!$isLocalMode) {
    // El token puede llegar por el enlace del email (GET) o por el campo oculto
    // del formulario (POST). Forma fija: 64 hex (bin2hex de 32 bytes). Validar
    // la forma antes de tocar la DB descarta basura sin consultar nada.
    $rawToken  = $_SERVER["REQUEST_METHOD"] === "POST"
        ? (string)($_POST["token"] ?? "")
        : (string)($_GET["token"] ?? "");
    $token     = preg_match('/^[0-9a-f]{64}$/', $rawToken) === 1 ? $rawToken : "";
    $tokenHash = $token !== "" ? hash("sha256", $token) : "";

    // La vigencia del token se consulta IGUAL en GET y en POST: el POST nunca
    // confía en que el GET anterior ya lo validó.
    $pdo      = null;
    $tokenRow = null;
    $dbFailed = false;
    if ($token !== "") {
        try {
            $pdo      = getDb($config);
            $tokenRow = resetFindToken($pdo, $tokenHash);
        } catch (Throwable $dbError) {
            error_log("[admin-reset] no se pudo validar el token: " . $dbError->getMessage());
            $dbFailed = true;
        }
    }
    $tokenValid = $tokenRow !== null;

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $csrf     = (string)($_POST["csrf_token"] ?? "");
        $password = (string)($_POST["password"] ?? "");
        $confirm  = (string)($_POST["password_confirm"] ?? "");

        if (!verifyCsrf($csrf)) {
            $error = "Sesión inválida. Recargá la página.";
        } elseif ($dbFailed) {
            $error      = "No pudimos procesar el enlace. Probá de nuevo en unos minutos.";
            $tokenValid = false;
        } elseif (!$tokenValid) {
            // Ausente, mal formado, inexistente, caducado o ya usado: lo mismo.
            $error = RESET_GENERIC_INVALID;
        } elseif (resetPasswordLength($password) < RESET_MIN_PASSWORD_LENGTH) {
            $error = "La contraseña debe tener al menos " . (int)RESET_MIN_PASSWORD_LENGTH . " caracteres.";
        } elseif (strlen($password) > RESET_MAX_PASSWORD_BYTES) {
            $error = "La contraseña es demasiado larga (máximo " . (int)RESET_MAX_PASSWORD_BYTES . " bytes).";
        } elseif (!hash_equals($confirm, $password)) {
            $error = "Las contraseñas no coinciden.";
        } else {
            try {
                $pdo->beginTransaction();
                try {
                    // Revalidación con lock de fila: cierra la carrera entre dos
                    // POST simultáneos que traigan el mismo token.
                    $row = resetFindToken($pdo, $tokenHash, true);
                    if ($row === null) {
                        $pdo->rollBack();
                        $error      = RESET_GENERIC_INVALID;
                        $tokenValid = false;
                    } else {
                        $email = adminNormalizeEmail((string)$row["email"]);

                        $update = $pdo->prepare(
                            "UPDATE admin_users
                                SET password_hash = :password_hash
                              WHERE email = :email"
                        );
                        $update->execute([
                            ":password_hash" => password_hash($password, PASSWORD_BCRYPT),
                            ":email"         => $email,
                        ]);
                        $accountUpdated = $update->rowCount() >= 1;

                        // Este token queda consumido…
                        $burn = $pdo->prepare(
                            "UPDATE admin_password_resets SET used_at = NOW() WHERE id = :id"
                        );
                        $burn->execute([":id" => $row["id"]]);

                        // …y cualquier otro enlace vivo de la misma cuenta también.
                        $burnRest = $pdo->prepare(
                            "UPDATE admin_password_resets
                                SET used_at = NOW()
                              WHERE email = :email AND used_at IS NULL"
                        );
                        $burnRest->execute([":email" => $email]);

                        $pdo->commit();

                        if (!$accountUpdated) {
                            // Token válido para una cuenta que ya no existe: el
                            // token igual se quema y la respuesta es genérica.
                            error_log("[admin-reset] token válido para una cuenta inexistente: " . $email);
                            $error      = RESET_GENERIC_INVALID;
                            $tokenValid = false;
                        } else {
                            // Sesión limpia: quien cambió la contraseña vuelve a
                            // entrar por el login.
                            $_SESSION = [];
                            session_destroy();

                            header("Location: login.php?reset=1");
                            exit;
                        }
                    }
                } catch (Throwable $txError) {
                    if ($pdo->inTransaction()) $pdo->rollBack();
                    throw $txError;
                }
            } catch (Throwable $unexpected) {
                error_log("[admin-reset] error inesperado: " . $unexpected->getMessage());
                $error = "No pudimos actualizar la contraseña. Probá de nuevo en unos minutos.";
            }
        }
    } elseif ($dbFailed) {
        $error = "No pudimos validar el enlace. Probá de nuevo en unos minutos.";
    } elseif (!$tokenValid) {
        $error = RESET_GENERIC_INVALID;
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
  <meta name="referrer" content="no-referrer">
  <title>Nueva contraseña · Admin Yutopias</title>
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
    .hint {
      font-size: 12px;
      color: #8B949E;
      margin-top: 6px;
    }
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
      line-height: 1.5;
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

    <h2>Nueva contraseña</h2>

<?php if ($isLocalMode): ?>
    <div class="notice">
      La recuperación de contraseña no está disponible en modo local: necesita las
      tablas <code>admin_users</code> y <code>admin_password_resets</code> de MySQL.
      En modo local el panel entra con auto-login.
    </div>
<?php else: ?>
    <?php if ($error): ?>
      <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <?php if ($tokenValid): ?>
    <p class="intro">Elegí una contraseña nueva para tu cuenta del panel.</p>

    <form method="POST" action="reset-password.php" autocomplete="off">
      <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
      <input type="hidden" name="token" value="<?= htmlspecialchars($token) ?>">

      <div class="field">
        <label for="password">Contraseña nueva</label>
        <input type="password" id="password" name="password"
               required autofocus autocomplete="new-password"
               minlength="<?= (int)RESET_MIN_PASSWORD_LENGTH ?>">
        <div class="hint">Mínimo <?= (int)RESET_MIN_PASSWORD_LENGTH ?> caracteres.</div>
      </div>

      <div class="field">
        <label for="password_confirm">Repetir contraseña</label>
        <input type="password" id="password_confirm" name="password_confirm"
               required autocomplete="new-password"
               minlength="<?= (int)RESET_MIN_PASSWORD_LENGTH ?>">
      </div>

      <button type="submit" class="btn">Guardar contraseña</button>
    </form>
    <?php else: ?>
    <p class="intro">
      Pedí un enlace nuevo desde la página de recuperación: los enlaces caducan a los
      30 minutos y sirven una sola vez.
    </p>
    <div class="alt-link">
      <a href="forgot-password.php">Solicitar un enlace nuevo</a>
    </div>
    <?php endif; ?>
<?php endif; ?>

    <div class="alt-link">
      <a href="login.php">Volver al login</a>
    </div>
  </div>
</body>
</html>
