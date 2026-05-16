<?php
declare(strict_types=1);
require_once __DIR__ . "/auth.php";
startSecureSession();

$csrf = (string)($_POST["csrf_token"] ?? "");
if (verifyCsrf($csrf)) {
    $_SESSION = [];
    session_destroy();
}
header("Location: login.php");
exit;
