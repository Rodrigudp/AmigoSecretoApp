/** Canonical public origin (RNF09). Prefer APP_URL; never invent a host. */
export function getAppUrl(): string {
  const raw = process.env.APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://amigo-secreto-app-five.vercel.app";
}
