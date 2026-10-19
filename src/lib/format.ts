/** Formats a WordPress site-local timestamp as wall-clock time (no timezone shift). */
export function formatDate(iso: string, withTime = false) {
  const d = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  const date = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).toLowerCase();
  return `${date} at ${time}`;
}
