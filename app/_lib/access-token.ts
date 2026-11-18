import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time equality for raw access tokens (ADR-004 / SEC-01). */
export function accessTokensEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a, "utf8").digest();
  const right = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(left, right);
}
