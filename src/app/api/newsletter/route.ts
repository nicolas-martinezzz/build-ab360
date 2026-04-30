import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = "nodejs";

type NewsletterPayload = {
  name?: string;
  email?: string;
  accepted?: boolean;
  locale?: string;
  website?: string;
  submittedAt?: number;
};

const MIN_SUBMIT_MS = 1500;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let pool: mysql.Pool | null = null;

const getDbPool = () => {
  if (pool) {
    return pool;
  }

  const host = process.env.NEWSLETTER_DB_HOST;
  const port = Number(process.env.NEWSLETTER_DB_PORT ?? "3306");
  const user = process.env.NEWSLETTER_DB_USER;
  const password = process.env.NEWSLETTER_DB_PASSWORD;
  const database = process.env.NEWSLETTER_DB_NAME;

  if (!host || !user || !password || !database) {
    throw new Error("Missing newsletter database env vars");
  }

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    charset: "utf8mb4",
  });

  return pool;
};

const ensureTableExists = async (db: mysql.Pool) => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255) NULL,
      locale VARCHAR(8) NULL,
      privacy_accepted TINYINT(1) NOT NULL DEFAULT 0,
      source VARCHAR(120) NOT NULL,
      ip_hash VARCHAR(64) NULL,
      user_agent VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_newsletter_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }
  return request.headers.get("x-real-ip") ?? "";
};

const hashIp = (ip: string): string | null => {
  if (!ip) {
    return null;
  }
  const salt = process.env.NEWSLETTER_IP_SALT ?? "newsletter-default-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
};

const sanitizeName = (name: string | undefined): string | null => {
  if (!name) {
    return null;
  }
  const normalized = name.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, 255) : null;
};

export const POST = async (request: Request) => {
  try {
    const payload = (await request.json()) as NewsletterPayload;
    const email = payload.email?.trim().toLowerCase() ?? "";
    const name = sanitizeName(payload.name);
    const locale = payload.locale?.trim().slice(0, 8) ?? "es";
    const accepted = Boolean(payload.accepted);
    const website = payload.website?.trim() ?? "";
    const submittedAt = Number(payload.submittedAt ?? 0);

    if (website) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!submittedAt || Date.now() - submittedAt < MIN_SUBMIT_MS) {
      return NextResponse.json({ message: "Suspicious submit timing" }, { status: 400 });
    }

    if (!accepted) {
      return NextResponse.json({ message: "Privacy consent required" }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const db = getDbPool();
    await ensureTableExists(db);

    const ipHash = hashIp(getClientIp(request));
    const userAgent = request.headers.get("user-agent")?.slice(0, 255) ?? null;

    await db.execute(
      `
      INSERT INTO newsletter_subscribers (email, name, locale, privacy_accepted, source, ip_hash, user_agent)
      VALUES (?, ?, ?, 1, 'site-footer', ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        locale = VALUES(locale),
        privacy_accepted = VALUES(privacy_accepted),
        source = VALUES(source),
        ip_hash = VALUES(ip_hash),
        user_agent = VALUES(user_agent)
      `,
      [email, name, locale, ipHash, userAgent],
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
};
