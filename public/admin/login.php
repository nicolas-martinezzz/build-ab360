<?php
declare(strict_types=1);
require_once __DIR__ . "/auth.php";

startSecureSession();
if (isLoggedIn()) {
    header("Location: index.php");
    exit;
}

$error  = "";
// Mensaje de éxito tras completar reset-password.php. Es un flag sin datos:
// no refleja ningún valor enviado por el usuario.
$notice = (($_GET["reset"] ?? "") === "1")
    ? "Contraseña actualizada. Iniciá sesión con la nueva contraseña."
    : "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $notice = "";
    $ip    = $_SERVER["REMOTE_ADDR"] ?? "unknown";
    $email = adminNormalizeEmail((string)($_POST["email"] ?? ""));
    $pass  = (string)($_POST["password"] ?? "");
    $csrf  = (string)($_POST["csrf_token"] ?? "");

    if (!verifyCsrf($csrf)) {
        $error = "Sesión inválida. Recargá la página.";
    } elseif (!checkRateLimit($ip)) {
        $error = "Demasiados intentos. Esperá 15 minutos.";
    } elseif (adminVerifyCredentials($config, $email, $pass)) {
        // Los hashes viven en `admin_users`; ADMIN_USERS sólo actúa de fallback
        // si esa consulta falla. Una cuenta con password_hash NULL nunca
        // verifica, así que cae en el mismo mensaje genérico de abajo.
        session_regenerate_id(true);
        $_SESSION["admin_logged_in"] = true;
        $_SESSION["admin_email"]     = $email;
        clearRateLimit($ip);
        header("Location: index.php");
        exit;
    } else {
        $error = "Email o contraseña incorrectos.";
    }
}

$token = csrfToken();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin · Yutopias</title>
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

    <?php if ($error): ?>
      <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <?php if ($notice): ?>
      <div class="notice"><?= htmlspecialchars($notice) ?></div>
    <?php endif; ?>

    <form method="POST" autocomplete="off">
      <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($token) ?>">

      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email"
               value="<?= htmlspecialchars($_POST["email"] ?? "") ?>"
               required autofocus placeholder="admin@yutopias.com">
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" required>
      </div>

      <button type="submit" class="btn">Ingresar</button>
    </form>

    <div class="alt-link">
      <a href="forgot-password.php">¿Olvidaste tu contraseña?</a>
    </div>
  </div>
</body>
</html>
