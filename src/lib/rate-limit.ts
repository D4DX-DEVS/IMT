/**
 * Minimal in-memory login throttle: after too many failures from one address (or too many overall)
 * further attempts are refused for a while. Resets when the server restarts.
 */
type Entry = { failures: number; windowStart: number; lockedUntil: number };

const WINDOW_MS = 15 * 60 * 1000;
const LIMITS = { perClient: 5, overall: 60 };
const GLOBAL_KEY = "*";
const entries = new Map<string, Entry>();

function entry(key: string, now: number): Entry {
  const e = entries.get(key);
  if (e && now - e.windowStart <= WINDOW_MS) return e;
  const fresh = { failures: 0, windowStart: now, lockedUntil: 0 };
  entries.set(key, fresh);
  return fresh;
}

/** Seconds the client must wait, or 0 if it may try. */
export function loginRetryAfter(client: string): number {
  const now = Date.now();
  const wait = Math.max(entry(client, now).lockedUntil, entry(GLOBAL_KEY, now).lockedUntil) - now;
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
}

export function recordLoginFailure(client: string) {
  const now = Date.now();
  for (const [key, limit] of [
    [client, LIMITS.perClient],
    [GLOBAL_KEY, LIMITS.overall],
  ] as const) {
    const e = entry(key, now);
    e.failures += 1;
    if (e.failures >= limit) e.lockedUntil = now + WINDOW_MS;
  }
}

export function clearLoginFailures(client: string) {
  entries.delete(client);
}
