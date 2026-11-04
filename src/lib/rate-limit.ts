import { db } from "@/storage";

/**
 * Login throttle kept in D1 (table `login_attempts`), so it holds across every worker instance and restart.
 * Each attempt is counted *before* the password is checked, in one atomic statement, so a burst of parallel
 * requests can't slip past the limit. After 5 attempts from one address in 15 minutes, further attempts are
 * refused for 15 minutes; a successful sign-in clears the count.
 *
 * There is deliberately no site-wide lock: anyone could trigger it and lock the real admin out.
 */
const WINDOW_MS = 15 * 60 * 1000;
const PER_CLIENT_LIMIT = 5;

/**
 * Counts a sign-in attempt for `client`. Returns the seconds it must wait if it is over the limit
 * (the attempt must then be refused without checking the password), or 0 if it may go ahead.
 */
export async function reserveLoginAttempt(client: string): Promise<number> {
  const now = Date.now();
  const database = await db();
  const row = await database
    .prepare(
      `INSERT INTO login_attempts (client, failures, window_start, locked_until) VALUES (?1, 1, ?2, 0)
       ON CONFLICT(client) DO UPDATE SET
         failures     = CASE WHEN ?2 - window_start > ?4 AND locked_until <= ?2 THEN 1 ELSE failures + 1 END,
         window_start = CASE WHEN ?2 - window_start > ?4 AND locked_until <= ?2 THEN ?2 ELSE window_start END,
         locked_until = CASE
                          WHEN locked_until > ?2 THEN locked_until
                          WHEN (CASE WHEN ?2 - window_start > ?4 THEN 1 ELSE failures + 1 END) > ?3 THEN ?2 + ?4
                          ELSE 0 END
       RETURNING failures, locked_until`,
    )
    .bind(client, now, PER_CLIENT_LIMIT, WINDOW_MS)
    .first<{ failures: number; locked_until: number }>();

  // Housekeeping: forget entries that are long expired. Best effort.
  await database
    .prepare("DELETE FROM login_attempts WHERE window_start < ?1 AND locked_until < ?1")
    .bind(now - 2 * WINDOW_MS)
    .run()
    .catch(() => undefined);

  const wait = (row?.locked_until ?? 0) - now;
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
}

/** After a successful sign-in, forget the client's attempts. */
export async function clearLoginFailures(client: string): Promise<void> {
  await (await db()).prepare("DELETE FROM login_attempts WHERE client = ?").bind(client).run();
}
