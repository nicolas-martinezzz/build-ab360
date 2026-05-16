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

CREATE TABLE IF NOT EXISTS bootcamp_leads (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name             VARCHAR(120)    NOT NULL,
    email            VARCHAR(255)    NOT NULL,
    role_name        VARCHAR(180)    NOT NULL,
    company          VARCHAR(180)    NOT NULL,
    locale           VARCHAR(8)      NULL,
    privacy_accepted TINYINT(1)      NOT NULL DEFAULT 0,
    source           VARCHAR(120)    NOT NULL,
    ip_hash          VARCHAR(64)     NULL,
    user_agent       VARCHAR(255)    NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_bootcamp_email (email),
    KEY idx_bootcamp_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
