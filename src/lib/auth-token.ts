import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin session tokens. Pure crypto, no Next.js imports, so the same code runs in `proxy.ts`,
 * server actions and route handlers.
 *
 * Credentials come from the environment:
 *   ADMIN_USERNAME, ADMIN_PASSWORD   the single admin account
 *   SESSION_SECRET                   at least 16 characters (32+ random ones are best), signs the session cookie
 * Changing the password or the secret signs everyone out.
 */
export const SESSION_COOKIE = "imt_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type AdminConfig = { username: string; password: string; secret: string };

export const MIN_SECRET_LENGTH = 16;

/** What is wrong with the admin settings, in words (names only, never values). Empty when they are fine. */
export function adminConfigProblems(): string[] {
  const { ADMIN_USERNAME: username, ADMIN_PASSWORD: password, SESSION_SECRET: secret } = process.env;
  const problems: string[] = [];
  if (!username) problems.push("ADMIN_USERNAME is not set");
  if (!password) problems.push("ADMIN_PASSWORD is not set");
  if (!secret) problems.push("SESSION_SECRET is not set");
  else if (secret.length < MIN_SECRET_LENGTH) {
    problems.push(`SESSION_SECRET is only ${secret.length} characters long; it needs at least ${MIN_SECRET_LENGTH} (32 or more is best)`);
  }
  return problems;
}

export function adminConfig(): AdminConfig | null {
  if (adminConfigProblems().length) return null;
  const { ADMIN_USERNAME: username, ADMIN_PASSWORD: password, SESSION_SECRET: secret } = process.env;
  return { username: username!, password: password!, secret: secret! };
}

const sha256 = (value: string) => createHash("sha256").update(value).digest();
const b64url = (buf: Buffer) => buf.toString("base64url");

function sign(payload: string, cfg: AdminConfig) {
  // The password is part of the key, so changing it invalidates every existing session.
  const key = `${cfg.secret}:${sha256(cfg.password).toString("hex")}`;
  return b64url(createHmac("sha256", key).update(payload).digest());
}

/** Constant-time check of a submitted username and password. */
export function verifyCredentials(username: string, password: string): boolean {
  const cfg = adminConfig();
  if (!cfg) return false;
  // Always compare both, so timing doesn't reveal which one was wrong.
  const userOk = timingSafeEqual(sha256(username), sha256(cfg.username));
  const passOk = timingSafeEqual(sha256(password), sha256(cfg.password));
  return userOk && passOk;
}

export function createSessionToken(): string | null {
  const cfg = adminConfig();
  if (!cfg) return null;
  const payload = b64url(Buffer.from(JSON.stringify({ u: cfg.username, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })));
  return `${payload}.${sign(payload, cfg)}`;
}

/** True if the token is genuine, unexpired and belongs to the configured admin. */
export function verifySessionToken(token: string | undefined | null): boolean {
  const cfg = adminConfig();
  if (!cfg || !token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return false;

  const expected = Buffer.from(sign(payload, cfg));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { u?: string; exp?: number };
    return data.u === cfg.username && typeof data.exp === "number" && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
