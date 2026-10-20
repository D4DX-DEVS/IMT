import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  adminConfig,
  createSessionToken,
  verifySessionToken,
} from "./auth-token";

export const adminConfigured = () => adminConfig() !== null;

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

export async function startSession(): Promise<boolean> {
  const token = createSessionToken();
  if (!token) return false;
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
