import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import type { DomainError } from "../domain/errors";
import { err, ok, type Result } from "../shared/result";

export type RateLimitAction =
  | "create_group"
  | "join_group"
  | "run_draw"
  | "affiliate_redirect"
  | "affiliate_click"
  | "owner_auth";
export type RateLimitPolicy = { limit: number; windowMs: number };
export type RateLimitReceipt = { remaining: number; resetAtMs: number };
export type RateLimiter = {
  check(action: RateLimitAction, clientKey: string): Result<RateLimitReceipt, DomainError>;
  reset(): void;
};

type Bucket = { count: number; resetAtMs: number };

export const DEFAULT_RATE_LIMIT_POLICIES: Record<RateLimitAction, RateLimitPolicy> = {
  create_group: { limit: 10, windowMs: 10 * 60_000 },
  join_group: { limit: 30, windowMs: 10 * 60_000 },
  run_draw: { limit: 10, windowMs: 10 * 60_000 },
  affiliate_redirect: { limit: 60, windowMs: 60_000 },
  affiliate_click: { limit: 30, windowMs: 10 * 60_000 },
  owner_auth: { limit: 10, windowMs: 10 * 60_000 },
};

const DEFAULT_MAX_ENTRIES = 10_000;
const IP_HEADERS = ["x-real-ip", "x-vercel-forwarded-for", "cf-connecting-ip", "x-forwarded-for"];

/** Extracts the client IP from Vercel or reverse-proxy (VPS) headers without throwing. */
export function extractClientIp(headers: Pick<Headers, "get">): string {
  for (const name of IP_HEADERS) {
    const value = headers.get(name)?.split(",")[0]?.trim();
    if (value) return value;
  }
  return "unknown";
}

function pruneExpired(buckets: Map<string, Bucket>, nowMs: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAtMs <= nowMs) buckets.delete(key);
  }
}

function ensureCapacity(buckets: Map<string, Bucket>, maxEntries: number, nowMs: number): void {
  if (buckets.size < maxEntries) return;
  pruneExpired(buckets, nowMs);
  if (buckets.size < maxEntries) return;
  const oldestKey = buckets.keys().next().value;
  if (oldestKey !== undefined) buckets.delete(oldestKey);
}

/** Creates an in-memory fixed-window rate limiter keyed by salted HMAC of client IP. */
export function createMemoryRateLimiter(options?: {
  now?: () => number;
  salt?: string;
  maxEntries?: number;
  policies?: Partial<Record<RateLimitAction, RateLimitPolicy>>;
}): RateLimiter {
  const now = options?.now ?? (() => Date.now());
  const salt = options?.salt ?? randomBytes(32).toString("hex");
  const maxEntries = options?.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const policies = { ...DEFAULT_RATE_LIMIT_POLICIES, ...options?.policies };
  const buckets = new Map<string, Bucket>();

  return {
    check(action, clientKey) {
      const policy = policies[action];
      const nowMs = now();
      const key = createHmac("sha256", salt).update(`${action}:${clientKey}`, "utf8").digest("hex");
      const existing = buckets.get(key);

      if (!existing || existing.resetAtMs <= nowMs) {
        if (existing) buckets.delete(key);
        ensureCapacity(buckets, maxEntries, nowMs);
        const resetAtMs = nowMs + policy.windowMs;
        buckets.set(key, { count: 1, resetAtMs });
        return ok({ remaining: policy.limit - 1, resetAtMs });
      }

      if (existing.count >= policy.limit) return err({ code: "RATE_LIMITED" });
      existing.count += 1;
      return ok({ remaining: policy.limit - existing.count, resetAtMs: existing.resetAtMs });
    },
    reset() {
      buckets.clear();
    },
  };
}

const globalForRateLimit = globalThis as typeof globalThis & { __amigoRateLimiter?: RateLimiter };

/** Returns the process-wide rate limiter shared across Next.js server actions/routes. */
export function getSharedRateLimiter(): RateLimiter {
  globalForRateLimit.__amigoRateLimiter ??= createMemoryRateLimiter();
  return globalForRateLimit.__amigoRateLimiter;
}
