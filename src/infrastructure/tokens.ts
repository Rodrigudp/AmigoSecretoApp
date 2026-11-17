import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { TokenService } from "../application/ports";

const TOKEN_BYTES = 32;
const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;

/** Generates a 256-bit random capability token encoded as 43-char base64url. */
export function generate(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** Computes the lowercase 64-char SHA-256 hex digest of a non-empty token. */
export function hash(token: string): string {
  if (typeof token !== "string" || token.length === 0) {
    throw new TypeError("Token must be a non-empty string.");
  }

  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Verifies a raw token against a SHA-256 hex digest in constant time. */
export function verify(raw: string, expectedHash: string): boolean {
  if (
    typeof raw !== "string" ||
    raw.length === 0 ||
    typeof expectedHash !== "string" ||
    !SHA256_HEX_PATTERN.test(expectedHash)
  ) {
    return false;
  }

  const actualDigest = createHash("sha256").update(raw, "utf8").digest();
  const expectedDigest = Buffer.from(expectedHash, "hex");

  return timingSafeEqual(actualDigest, expectedDigest);
}

/** TokenService port adapter backed by Node crypto primitives. */
export const tokenService: TokenService & {
  verify(raw: string, expectedHash: string): boolean;
} = {
  generate,
  hash,
  verify,
};
