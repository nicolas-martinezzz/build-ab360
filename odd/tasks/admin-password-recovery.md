# admin-password-recovery

Recuperación de contraseña para el panel admin (`admin.yutopias.com`), con las
cuentas migradas de la constante PHP `ADMIN_USERS` a la tabla `admin_users`.

- Rama: `feat/admin-password-recovery`
- Base: `main`
- Commits: `a7aa17d` (feature) + el commit de este pase de seguridad

## Objetivo

Que un admin pueda rotar su propia contraseña sin tocar código ni base de datos
a mano, y que esa rotación sea **real**: la contraseña vieja deja de servir por
todos los caminos, y las sesiones abiertas con ella se caen.

## Problema

La contraseña del panel vivía como hash bcrypt en `ADMIN_USERS`, dentro de
`public/admin/auth.php`, en un repositorio **público**. Cambiarla exigía editar
código y desplegar; y los hashes quedaron publicados desde el commit `a3b7459`.

## Estado

Feature implementada en `a7aa17d`. Una revisión de seguridad adversarial
dictaminó **NO DESPLEGAR** con 4 bloqueantes. Los 4 están corregidos (abajo).

## Alcance autorizado

`public/admin/auth.php`, `public/admin/login.php`,
`public/admin/forgot-password.php`, `public/admin/reset-password.php`,
`private/smtp_mailer.php`, `scripts/db-setup-production.sql`, este documento.

Fuera de alcance por decisión del orquestador: mover el token del query string
al cuerpo del POST (C7) y forzar `Secure` en la cookie de sesión. `checkRateLimit`
no se toca.

---

## Bloqueantes de seguridad corregidos

### [x] C1 (CRÍTICO) — El fallback de emergencia mantenía viva una credencial publicada

`ADMIN_USERS` tenía los hashes bcrypt reales de las dos cuentas, publicados en
un repo público. Con el fallback anterior, **rotar la contraseña desde el panel
no la rotaba**: ante cualquier fallo de consulta a `admin_users` (tabla no
migrada, DB caída) la contraseña vieja publicada volvía a servir. Puerta trasera
permanente que anulaba el propósito de la feature.

Corrección:

- `public/admin/auth.php:49` — `define("ADMIN_USERS", []);`, con el comentario
  que explica por qué está vacía y por qué no debe volver a poblarse.
- `public/admin/auth.php:277-299` — `adminFallbackHash()` nueva: lee el fallback
  de `$config["admin_users_fallback"]`, que viene de
  `private/newsletter-config.php` (sólo en el servidor, no versionado).
  Normaliza las claves, así que el email puede estar escrito como sea.
- `public/admin/auth.php:301-329` — `adminVerifyCredentials()` consulta el
  fallback **únicamente** dentro del `catch`, es decir sólo si la consulta a
  `admin_users` lanzó. Si la clave de config no existe, no hay fallback: el
  login **falla cerrado** y escribe `error_log`.
- Una consulta que SÍ se pudo hacer y devuelve "no existe" o `password_hash`
  NULL falla ahí mismo, sin mirar el fallback: tabla vacía significa
  "nadie entra".

#### Formato exacto de la clave de config (para el servidor)

`private/newsletter-config.php` devuelve un array. Agregar la clave sólo si se
quiere conservar red de seguridad ante un fallo de DB:

```php
<?php
return [
    // ... el resto de la config existente (db_host, db_name, ip_salt, …) ...

    // Fallback de emergencia del login del panel. OPCIONAL.
    // Se consulta SÓLO si la consulta a `admin_users` lanza excepción.
    // Si esta clave no está, el login falla cerrado ante un fallo de DB.
    //   - clave : email de la cuenta (se normaliza a minúsculas/trim)
    //   - valor : hash bcrypt de la contraseña (string, como lo devuelve
    //             password_hash($pass, PASSWORD_BCRYPT))
    // NUNCA la contraseña en claro. NUNCA un hash que ya esté publicado.
    "admin_users_fallback" => [
        "jjm@yutopias.com"             => '$2y$10$...hash bcrypt...',
        "nicolas.martinez23@gmail.com" => '$2y$10$...hash bcrypt...',
    ],
];
```

Recomendación: **dejarla fuera** y verificar que `admin_users` está sembrada.
Un fallback estático es una segunda credencial que hay que rotar a mano cada
vez que se rota la del panel; si se conserva, debe actualizarse junto con cada
rotación o vuelve a ser una contraseña vieja viva.

### [x] C2 (ALTO) — Bypass de CSRF con token vacío

`hash_equals($_SESSION["csrf_token"] ?? "", $token)` devuelve TRUE cuando ambos
lados son `""`. Un POST sin cookie de sesión arranca una sesión vacía, así que
un formulario enviado con `csrf_token=""` pasaba el chequeo. Afectaba a los tres
formularios del panel, porque `csrfToken()` —lo que siembra la clave de sesión—
se llama DESPUÉS de procesar el POST.

Corrección: `public/admin/auth.php:172-183` — si el conocido o el presentado
están vacíos, `verifyCsrf()` devuelve `false` antes de comparar.

### [x] C3 (ALTO) — Un atacante podía bloquear el canal de recuperación del admin

El límite de 3/hora se contaba por email **objetivo** sin importar quién
solicitaba, y cada solicitud nueva invalidaba los tokens vivos de esa cuenta.
Tres POST por hora contra `jjm@yutopias.com` dejaban al admin real sin poder
recibir ningún enlace, en silencio y de forma indefinida.

Corrección en `public/admin/forgot-password.php:141-203`, con las dos mitades
—hacen falta las dos, con una sola el bloqueo sigue siendo posible:

- El límite horario se cuenta por **(email + ip_hash del solicitante)**: un
  tercero ya no consume la cuota del admin legítimo.
- Pedir un enlace nuevo invalida sólo los anteriores **del mismo solicitante**:
  una solicitud ajena no mata el enlace que el admin ya tiene en la bandeja.
  Pueden convivir varios enlaces vigentes por cuenta; cada uno sigue siendo de
  un solo uso y con TTL de 30 minutos.
- Si no hay `ip_salt` configurado, `adminIpHash()` devuelve null y no se puede
  distinguir solicitantes: ahí se cuenta por email (techo conservador, como
  antes) y no se invalida nada de nadie.

La no-enumeración queda intacta: `FORGOT_GENERIC_NOTICE` se fija antes del
`try` y ningún camino nuevo lo cambia; el piso de duración del POST sigue igual.

### [x] C4 (MEDIO) — Cambiar la contraseña no invalidaba las sesiones abiertas

`requireAuth()` sólo miraba `$_SESSION["admin_logged_in"]`, así que un atacante
con sesión viva sobrevivía al reset.

Corrección:

- `scripts/db-setup-production.sql:181` — columna `password_changed_at DATETIME
  NULL` en el `CREATE TABLE admin_users`, y en `scripts/db-setup-production.sql:188-198`
  el `ALTER TABLE` documentado para una tabla que ya exista (`CREATE TABLE IF NOT
  EXISTS` no agrega columnas).
- `public/admin/reset-password.php:148-157` — `password_changed_at = NOW()` en
  el mismo `UPDATE` y la misma transacción que `password_hash`.
- `public/admin/login.php:29-53` — al autenticar, el valor vivo queda en
  `$_SESSION["admin_pwd_stamp"]`. Se lee **antes** de verificar la credencial a
  propósito: si una rotación cae entre los dos pasos, la sesión queda con el
  sello viejo y se cierra en la carga siguiente; leerlo después dejaría una
  ventana en la que un login con la contraseña vieja se quedaría con el sello
  nuevo y sobreviviría a la rotación que debía echarlo.
- `public/admin/auth.php:97-127` — `requireAuth()` revalida en cada carga: si el
  `password_changed_at` vivo difiere del guardado, destruye la sesión y manda al
  login (`adminEndSession()`, `public/admin/auth.php:90-95`).
- Fallo de DB en `requireAuth()`: **decisión deliberada documentada en el
  código** — se registra en `error_log` y se permite continuar con la sesión
  vigente. Cerrar convertiría cualquier hipo de DB en un lockout total del admin
  legítimo. El riesgo aceptado es que una sesión robada sobreviva mientras la DB
  está caída.
- `""` (cadena vacía) representa "nunca rotada", así que las sesiones abiertas
  antes de este despliegue, y la migración en sí, no expulsan a nadie.

---

## Extras del mismo pase

- [x] `htmlspecialchars($v, ENT_QUOTES, "UTF-8")` de forma consistente en los
      tres archivos del panel (`login.php`, `forgot-password.php`,
      `reset-password.php`). En `login.php` el reflejo de `$_POST["email"]`
      además se castea a string: con `email[]=x` la plantilla tiraba un
      `TypeError` (500).
- [x] `private/smtp_mailer.php:7-11` — `preg_replace('/[\r\n]+/', '', …)` sobre
      `$to` y `$subject` dentro del mailer: la defensa anti-CRLF ya no depende
      de que cada llamador se acuerde de sanear. Nada más de ese archivo cambió.
- [x] `public/admin/reset-password.php:126-129` — `password_hash()` se calcula
      **antes** de `beginTransaction()`: bcrypt es deliberadamente lento y
      dentro de la transacción mantenía abierto el lock de fila de
      `admin_password_resets` todo ese tiempo.

---

## ORDEN DE DESPLIEGUE (corregido)

El orden **cambió** respecto del plan original: antes el fallback en el código
protegía contra un lockout si se subía el PHP primero. Ya no existe. Si se sube
el código con `admin_users` vacía, **nadie puede entrar al panel**.

1. **phpMyAdmin — esquema.** Ejecutar los `CREATE TABLE` de `admin_users` y
   `admin_password_resets` de `scripts/db-setup-production.sql`. Si
   `admin_users` ya existe de un despliegue anterior, ejecutar además el
   `ALTER TABLE … ADD COLUMN password_changed_at DATETIME NULL`.
2. **phpMyAdmin — sembrar `admin_users`. OBLIGATORIO Y ANTES DEL SFTP.** Pegar
   los hashes que todavía viven en la constante `ADMIN_USERS` del `auth.php`
   **que está en el servidor** (el código nuevo ya no los tiene). Son los
   hashes publicados, o sea contraseñas comprometidas: sirven sólo para no
   perder el acceso durante el despliegue, y el paso 6 las reemplaza. La
   sentencia está comentada en `scripts/db-setup-production.sql` y es
   idempotente (`ON DUPLICATE KEY UPDATE id = id`).
3. **Servidor — config (opcional).** Si se decide conservar red de seguridad,
   agregar `admin_users_fallback` a `private/newsletter-config.php` con el
   formato de arriba. Si no, no hacer nada: el login falla cerrado ante un
   fallo de DB, que es el comportamiento deseado.
4. **SFTP — código.** Subir `public/admin/auth.php`, `login.php`,
   `forgot-password.php`, `reset-password.php` y `private/smtp_mailer.php`.
5. **Smoke test.** Login con la contraseña actual; `/forgot-password.php` con un
   email inexistente (debe dar el mismo mensaje genérico); `/forgot-password.php`
   con la cuenta real y comprobar que llega el email.
6. **Rotar AMBAS contraseñas por el flujo nuevo. No es opcional.** Las dos
   contraseñas actuales están publicadas en el repo. Rotar `jjm@yutopias.com` y
   `nicolas.martinez23@gmail.com` desde `/forgot-password.php`. Al terminar,
   verificar que la contraseña vieja ya no entra y que las sesiones abiertas con
   ella fueron expulsadas.
7. **Si se conservó `admin_users_fallback`**, actualizar sus hashes con los
   nuevos después del paso 6; si no, borrar la clave. Un fallback con el hash
   viejo reintroduce exactamente el C1.

---

## Verificación ejecutada

- `php -l` sin errores en `public/admin/auth.php`, `public/admin/login.php`,
  `public/admin/forgot-password.php`, `public/admin/reset-password.php`,
  `private/smtp_mailer.php`.
- Arnés temporal de PHP puro fuera del repo (scratchpad), con `auth.php` copiado
  byte a byte salvo `getDb()`, reemplazada por una costura que inyecta un stub
  de `PDO`/`PDOStatement` o lanza para simular "DB no disponible". Sin base de
  datos real. **28 casos, 28 OK, 0 FAIL**, cubriendo:
  - `verifyCsrf`: `("","")`, `("abc","")`, `("","abc")`, `("abc","abc")`,
    `("abc","abd")` y los dos casos sin la clave de sesión.
  - `adminVerifyCredentials`: hash válido con password correcta e incorrecta,
    normalización del email, `password_hash` NULL, `password_hash` vacío, cuenta
    inexistente, excepción de DB sin fallback, excepción de DB con fallback
    (password correcta e incorrecta, clave en mayúsculas, otro email, hash
    vacío, config no-array).
  - Regresiones: tabla vacía / `password_hash` NULL / `password_hash` vacío **con**
    fallback presente y password correcta → siguen fallando. El fallback vive
    sólo en el camino de excepción.
  - `adminPasswordStamp` / `adminCurrentPasswordStamp`: sello presente, NULL,
    cuenta inexistente, DB caída (devuelve null sin lanzar).

### Pendiente (requiere servidor, no se puede verificar acá)

- Smoke test end-to-end del flujo de email contra Postfix.
- Comportamiento real de `password_changed_at` contra MySQL (el arnés lo
  verifica contra el stub, no contra el motor).

## Riesgo residual

- **Inundación de la bandeja desde muchas IPs.** El techo horario es por
  solicitante, así que un atacante con muchas IPs puede generar muchos enlaces
  vigentes (cada uno de un solo uso y con TTL de 30 min) y muchos emails. Ya no
  puede bloquear la recuperación, pero sí hacer ruido. `checkRateLimit` (10 por
  15 min por IP) acota el abuso por IP. Un cap global por cuenta se descartó a
  propósito: cualquier cap global es llenable por el atacante y reintroduce
  exactamente el bloqueo que C3 describe.
- **`admin_users_fallback`, si se conserva, es una segunda credencial** que hay
  que rotar a mano junto con la del panel.
- **Sesión robada durante una caída de DB:** `requireAuth()` no puede revalidar
  el sello y permite continuar (decisión documentada en C4).
- C7 (token en el query string) y el `Secure` de la cookie siguen abiertos por
  decisión del orquestador.
