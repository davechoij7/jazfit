/**
 * Date helpers for Jazmin's timezone (America/Los_Angeles).
 *
 * Why: Vercel Functions run in UTC, so `new Date().toISOString().split("T")[0]`
 * returns a UTC date. At 5pm PDT on Monday it's already Tuesday UTC — which
 * silently breaks streak logic, recent-session lookbacks, and webhook backfill
 * windows. Always use these helpers for server-side dates that are stored or
 * compared as YYYY-MM-DD.
 *
 * Client-side code is fine as-is: Jaz's iPhone already runs in LA local time,
 * so `new Date().getDate()` returns what she expects.
 */

const LA_TIMEZONE = "America/Los_Angeles";
const laFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: LA_TIMEZONE });
// en-CA renders as YYYY-MM-DD, which is what Postgres expects for `date` columns.

/** Today's date in LA as YYYY-MM-DD. */
export function todayInLA(): string {
  return laFormatter.format(new Date());
}

/** Date `n` days before today in LA as YYYY-MM-DD. (n=0 → today) */
export function daysAgoInLA(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return laFormatter.format(d);
}

/** Format any Date as YYYY-MM-DD in LA. */
export function toLADate(d: Date): string {
  return laFormatter.format(d);
}
