import { createHash, timingSafeEqual } from "node:crypto";

export function authorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 32 || !header?.startsWith("Basic ")) return false;
  const credentials = Buffer.from(header.slice(6), "base64").toString("utf8");
  const separator = credentials.indexOf(":");
  if (separator < 0) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(credentials.slice(separator + 1)), digest(secret));
}

export function metrics(groups: number, joins: number, clicks: number) {
  return {
    joins,
    perGroup: groups
      ? (joins / groups).toLocaleString("pt-BR", { maximumFractionDigits: 2 })
      : "Indisponível",
    perJoin: joins
      ? (clicks / joins).toLocaleString("pt-BR", { maximumFractionDigits: 2 })
      : "Indisponível",
  };
}
