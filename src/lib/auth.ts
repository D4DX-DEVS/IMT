import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "./auth-token";


export async function isAdmin(): Promise<boolean> {
  // Checking a session depends on the current time; this keeps it out of prerendering.
  await connection();
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Call at the top of every admin page and server action. The proxy already redirects
 * anonymous visitors, but actions are public endpoints, so each one checks for itself.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/**
 * Whether the visitor reached the site over HTTPS, directly or through a proxy such as DigitalOcean App
 * Platform (which sets `X-Forwarded-Proto`). A `Secure` cookie is only kept and sent back over HTTPS (and,
 * in some browsers, `localhost`), so flagging it by NODE_ENV instead would make sign-in appear to work and
 * then lose the session on the next page when the site is opened over plain http, e.g. `npm start` on a LAN address.
 */
async function isHttps(): Promise<boolean> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (forwarded) return forwarded === "https";
  return h.get("origin")?.toLowerCase().startsWith("https://") ?? false;
}

export async function startSession(): Promise<boolean> {
  const token = createSessionToken();
  if (!token) return false;
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await isHttps(),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
