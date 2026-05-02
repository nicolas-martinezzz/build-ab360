-- ============================================================
-- AB360 V3 — Full DB reset (STAGING ONLY)
-- Drops and recreates ALL tables across the three endpoints.
-- Run this when you need a clean slate on the staging database.
--
-- Usage (from CLI):
--   mysql -h HOST -u USER -pPASS DB_NAME < scripts/db-reset-staging.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS diagnostic_leads;
DROP TABLE IF EXISTS diagnostic_results;
DROP TABLE IF EXISTS diagnostic_answers;
DROP TABLE IF EXISTS diagnostic_sessions;
DROP TABLE IF EXISTS bootcamp_leads;
DROP TABLE IF EXISTS newsletter_subscribers;

SET FOREIGN_KEY_CHECKS = 1;

-- ── newsletter_subscribers ───────────────────────────────────────────────────

CREATE TABLE newsletter_subscribers (
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

CREATE TABLE bootcamp_leads (
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
-- One row per diagnostic attempt. Created by action=init (server generates ID).
-- profile starts as 'pending' until the user picks one in step 2.

CREATE TABLE diagnostic_sessions (
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
-- One row per question per session, upserted on every answer change.
-- question_index is 0-based (0-11 for 12 questions).
-- option_score is always one of: 0, 30, 70, 100.

CREATE TABLE diagnostic_answers (
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
-- Computed results written after all 12 questions are answered.
-- score_a/b/c/d are performance percentages (0-100, high = good).

CREATE TABLE diagnostic_results (
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

-- ── diagnostic_leads ─────────────────────────────────────────────────────────
-- Contact info captured at prelead (step 1) and/or the bridge form on results.
-- privacy_accepted = 1 required in both cases before inserting.

CREATE TABLE diagnostic_leads (
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
