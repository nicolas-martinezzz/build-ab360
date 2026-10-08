-- ============================================================
-- AB360 V3 — DB setup PRODUCCIÓN (yutopias.com)
-- Crea todas las tablas desde cero. Sin DROP — base de datos nueva.
--
-- Ejecutar desde phpMyAdmin en Plesk:
--   Seleccionar DB: yutopias-pro
--   Pegar este contenido y ejecutar.
-- ============================================================

-- ── newsletter_subscribers ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email            VARCHAR(255)    NOT NULL,
    name             VARCHAR(255)    NULL,
    locale           VARCHAR(8)      NULL,
    privacy_accepted TINYINT(1)      NOT NULL DEFAULT 0,
    source           VARCHAR(120)    NOT NULL,
    ip_hash          VARCHAR(64)     NULL,
    user_agent       VARCHAR(255)    NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_newsletter_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── bootcamp_leads ───────────────────────────────────────────────────────────
-- `lunch` ('yes'|'no') and `company_type` ('member'|'non_member') were added
-- for the Bootcamp Zero × APCE Catalunya campaign (22/10/2026, es-only form).
-- See odd/tasks/bootcamp-zero-programa.md.

CREATE TABLE IF NOT EXISTS bootcamp_leads (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name             VARCHAR(120)    NOT NULL,
    email            VARCHAR(255)    NOT NULL,
    role_name        VARCHAR(180)    NOT NULL,
    company          VARCHAR(180)    NOT NULL,
    locale           VARCHAR(8)      NULL,
    lunch            VARCHAR(16)     NULL,
    company_type     VARCHAR(16)     NULL,
    privacy_accepted TINYINT(1)      NOT NULL DEFAULT 0,
    source           VARCHAR(120)    NOT NULL,
    ip_hash          VARCHAR(64)     NULL,
    user_agent       VARCHAR(255)    NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_bootcamp_email (email),
    KEY idx_bootcamp_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- If `bootcamp_leads` already exists in production without these columns
-- (i.e. this script is being re-run against an existing DB rather than used
-- to bootstrap a brand new one), run this once instead of the CREATE TABLE
-- above:
--
-- ALTER TABLE bootcamp_leads
--     ADD COLUMN lunch        VARCHAR(16) NULL AFTER locale,
--     ADD COLUMN company_type VARCHAR(16) NULL AFTER lunch;

-- ── diagnostic_sessions ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id           VARCHAR(64)  NOT NULL,
    locale       VARCHAR(8)   NOT NULL,
    profile      VARCHAR(64)  NOT NULL DEFAULT 'pending',
    source       VARCHAR(64)  NOT NULL DEFAULT 'autodiagnostico',
    ip_hash      VARCHAR(64)  NULL,
    user_agent   VARCHAR(255) NULL,
    status       ENUM('lead_captured','started','completed') NOT NULL DEFAULT 'started',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP    NULL     DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_sessions_created (created_at),
    KEY idx_sessions_status  (status),
    KEY idx_sessions_profile (profile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── diagnostic_answers ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS diagnostic_answers (
    id             BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    session_id     VARCHAR(64)      NOT NULL,
    question_index TINYINT UNSIGNED NOT NULL COMMENT '0-based, 0-11',
    dimension      CHAR(1)          NOT NULL COMMENT 'A | B | C | D',
    option_index   TINYINT UNSIGNED NOT NULL COMMENT '0-3',
    option_score   TINYINT UNSIGNED NOT NULL COMMENT '0 | 30 | 70 | 100',
    created_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_answer (session_id, question_index),
    KEY idx_answers_session (session_id),
    CONSTRAINT fk_answers_session
        FOREIGN KEY (session_id) REFERENCES diagnostic_sessions (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── diagnostic_results ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS diagnostic_results (
    session_id      VARCHAR(64)      NOT NULL,
    profile         VARCHAR(64)      NOT NULL DEFAULT 'unknown',
    weighted_score  TINYINT UNSIGNED NOT NULL COMMENT '0-100',
    score_over_10   DECIMAL(3,1)     NOT NULL COMMENT '0.0-10.0',
    score_a         TINYINT UNSIGNED NULL     COMMENT 'performance % dim A (high = good)',
    score_b         TINYINT UNSIGNED NULL     COMMENT 'performance % dim B',
    score_c         TINYINT UNSIGNED NULL     COMMENT 'performance % dim C',
    score_d         TINYINT UNSIGNED NULL     COMMENT 'performance % dim D',
    top_reto_1      VARCHAR(255)     NULL,
    top_reto_2      VARCHAR(255)     NULL,
    top_reto_3      VARCHAR(255)     NULL,
    summary_json    TEXT             NULL,
    updated_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id),
    KEY idx_results_profile (profile),
    CONSTRAINT fk_results_session
        FOREIGN KEY (session_id) REFERENCES diagnostic_sessions (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── reserva_plaza_leads ──────────────────────────────────────────────────────
-- LEGACY: la página /reserva-plaza (y su API reserva-plaza.php) se eliminó el
-- 07/10/2026 — el único formulario de inscripción es ahora el de la campaña en
-- /programa (bootcamp_leads). La tabla se conserva por los datos históricos;
-- no borrarla.

CREATE TABLE IF NOT EXISTS reserva_plaza_leads (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name             VARCHAR(120)    NOT NULL,
    company          VARCHAR(180)    NOT NULL,
    email            VARCHAR(255)    NOT NULL,
    locale           VARCHAR(8)      NULL,
    privacy_accepted TINYINT(1)      NOT NULL DEFAULT 1,
    ip_hash          VARCHAR(64)     NULL,
    user_agent       VARCHAR(255)    NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_rp_email (email),
    KEY idx_rp_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── diagnostic_leads ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS diagnostic_leads (
    session_id       VARCHAR(64)  NOT NULL,
    first_name       VARCHAR(120) NOT NULL,
    last_name        VARCHAR(120) NULL,
    company          VARCHAR(180) NOT NULL,
    role_name        VARCHAR(180) NULL,
    email            VARCHAR(255) NOT NULL,
    challenge_text   TEXT         NULL,
    privacy_accepted TINYINT(1)   NOT NULL DEFAULT 0,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id),
    KEY idx_leads_email (email),
    CONSTRAINT fk_leads_session
        FOREIGN KEY (session_id) REFERENCES diagnostic_sessions (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── admin_users ──────────────────────────────────────────────────────────────
-- Cuentas del panel admin (admin.yutopias.com). Sustituye a la constante PHP
-- ADMIN_USERS de public/admin/auth.php, que quedó VACÍA: los hashes que tenía
-- están publicados en este repositorio público, así que el fallback ya no vive
-- en el código. Esta tabla es la ÚNICA fuente de verdad; la red de seguridad
-- opcional ante un fallo de DB es $config["admin_users_fallback"] en
-- private/newsletter-config.php (sólo en el servidor, no versionado).
-- Ver odd/tasks/admin-password-recovery.md.
--
-- `password_hash` NULL = cuenta SIN contraseña: no puede iniciar sesión nunca
-- (login.php trata NULL como credencial inválida) y debe establecer su
-- contraseña mediante el flujo de recuperación (/forgot-password.php).
--
-- `password_changed_at` = momento de la última rotación. login.php lo guarda en
-- la sesión al autenticar y requireAuth() lo revalida en cada carga: si cambió,
-- la sesión es anterior al cambio de contraseña y se destruye. Es lo que hace
-- que un reset expulse las sesiones ya abiertas (incluida la de un atacante).

CREATE TABLE IF NOT EXISTS admin_users (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email               VARCHAR(255) NOT NULL,
    password_hash       VARCHAR(255) NULL,     -- NULL = cuenta sin contraseña: debe establecerla vía recuperación
    password_changed_at DATETIME     NULL,     -- última rotación; NULL = nunca rotada. Invalida sesiones abiertas
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── MIGRACIÓN: password_changed_at sobre una tabla ya existente ───────────────
-- `CREATE TABLE IF NOT EXISTS` NO agrega columnas a una tabla que ya existe. Si
-- `admin_users` se creó en un despliegue anterior, ejecutar esto UNA SOLA VEZ
-- antes de subir el código nuevo:
--
-- ALTER TABLE admin_users
--     ADD COLUMN password_changed_at DATETIME NULL AFTER password_hash;
--
-- Dejarla en NULL para las cuentas existentes es correcto: NULL significa
-- "nunca rotada", y las sesiones abiertas guardan el mismo valor vacío, así que
-- nadie queda expulsado por la migración en sí.

-- ── admin_password_resets ────────────────────────────────────────────────────
-- Tokens de un solo uso para restablecer la contraseña del panel.
-- `token_hash` es el sha256 (hex, 64 chars) del token: el token EN CLARO nunca
-- se guarda ni se registra en logs, sólo viaja en el enlace del email.
-- `ip_hash` usa el mismo salteado que el resto del proyecto:
--   sha256(ip . ':' . ip_salt)  — ver public/api/bootcamp-lead.php.

CREATE TABLE IF NOT EXISTS admin_password_resets (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email      VARCHAR(255) NOT NULL,
    token_hash CHAR(64)     NOT NULL,         -- sha256 del token; el token crudo NUNCA se guarda
    expires_at DATETIME     NOT NULL,
    used_at    DATETIME     NULL,
    ip_hash    VARCHAR(64)  NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_token (token_hash),
    KEY idx_email_created (email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ⚠️  Los hashes NO se escriben en este archivo: está versionado en el
-- repositorio, así que cualquier hash pegado aquí queda publicado. Copialos en
-- el momento de ejecutar la migración desde el auth.php que vive EN EL
-- SERVIDOR, y no guardes la sentencia ya rellenada en ningún sitio.
--
-- ── MIGRACIÓN: sembrar admin_users ───────────────────────────────────────────
-- ⚠️  OBLIGATORIO Y ANTES DE SUBIR EL CÓDIGO. El código nuevo tiene ADMIN_USERS
-- VACÍA: ya no hay fallback en el código que evite el lockout. Si se sube el
-- PHP primero y la tabla está vacía, NADIE puede entrar al panel.
--
-- Ejecutar UNA SOLA VEZ, desde phpMyAdmin, DESPUÉS de crear las dos tablas de
-- arriba y ANTES del SFTP. Orden correcto:
--   1) CREATE TABLE (+ ALTER de password_changed_at si la tabla ya existía)
--   2) sembrar admin_users (esta sentencia)
--   3) SFTP del código nuevo
--   4) smoke test de login
--   5) rotar AMBAS contraseñas por /forgot-password.php  ← no es opcional
--
-- Los hashes a pegar son los que viven en la constante ADMIN_USERS del auth.php
-- QUE TODAVÍA ESTÁ EN EL SERVIDOR (el código nuevo ya no los tiene). Sirven
-- sólo para no perder el acceso durante el despliegue: son los hashes
-- publicados en el repositorio público, así que esas contraseñas están
-- comprometidas y el paso 5 las reemplaza de inmediato.
--
-- `ON DUPLICATE KEY UPDATE id = id` hace la sentencia idempotente:
-- re-ejecutarla NO sobreescribe una contraseña ya cambiada desde el panel.
--
-- INSERT INTO admin_users (email, password_hash) VALUES
--     ('jjm@yutopias.com',             '<<PEGAR_HASH_DESDE_auth.php_EN_EL_SERVIDOR>>'),
--     ('nicolas.martinez23@gmail.com', '<<PEGAR_HASH_DESDE_auth.php_EN_EL_SERVIDOR>>')
-- ON DUPLICATE KEY UPDATE id = id;
--
-- ── Alta de una cuenta nueva SIN contraseña ──────────────────────────────────
-- La cuenta queda inhabilitada para login (password_hash NULL) hasta que su
-- dueño la active pidiendo un enlace en https://admin.yutopias.com/forgot-password.php
--
-- INSERT INTO admin_users (email, password_hash) VALUES
--     ('nicolasmartinezc@icloud.com', NULL)
-- ON DUPLICATE KEY UPDATE id = id;
--
-- ── Limpieza opcional (cron / mantenimiento manual) ──────────────────────────
-- Los tokens caducados o usados no sirven para nada; se pueden purgar.
--
-- DELETE FROM admin_password_resets
--  WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
