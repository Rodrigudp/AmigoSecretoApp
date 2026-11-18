// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createMemoryRateLimiter,
  extractClientIp,
  getSharedRateLimiter,
} from "../../src/infrastructure/rate-limit";

describe("rate limiter (SEC-03)", () => {
  it("enforces per-action limits and resets after window expiry", () => {
    let clockMs = 1_000_000;
    const limiter = createMemoryRateLimiter({
      now: () => clockMs,
      salt: "fixed-salt",
      policies: { create_group: { limit: 2, windowMs: 60_000 } },
    });

    expect(limiter.check("create_group", "203.0.113.10")).toEqual({
      ok: true,
      value: { remaining: 1, resetAtMs: 1_060_000 },
    });
    expect(limiter.check("create_group", "203.0.113.10").ok).toBe(true);
    expect(limiter.check("create_group", "203.0.113.10")).toEqual({
      ok: false,
      error: { code: "RATE_LIMITED" },
    });
    expect(limiter.check("join_group", "203.0.113.10").ok).toBe(true);

    clockMs += 60_000;
    expect(limiter.check("create_group", "203.0.113.10").ok).toBe(true);
  });

  it("bounds memory via expired pruning and oldest eviction", () => {
    let clockMs = 5_000;
    const limiter = createMemoryRateLimiter({
      now: () => clockMs,
      salt: "fixed-salt",
      maxEntries: 2,
      policies: { create_group: { limit: 2, windowMs: 10_000 } },
    });

    expect(limiter.check("create_group", "ip-1").ok).toBe(true);
    expect(limiter.check("create_group", "ip-2").ok).toBe(true);
    expect(limiter.check("create_group", "ip-3").ok).toBe(true);
    expect(limiter.check("create_group", "ip-1")).toEqual({
      ok: true,
      value: { remaining: 1, resetAtMs: 15_000 },
    });

    clockMs += 15_000;
    expect(limiter.check("create_group", "ip-4").ok).toBe(true);
    limiter.reset();
    expect(getSharedRateLimiter()).toBe(getSharedRateLimiter());
  });

  it("extracts IP from Vercel and VPS proxy headers", () => {
    expect(extractClientIp(new Headers({ "x-real-ip": "198.51.100.1" }))).toBe("198.51.100.1");
    expect(extractClientIp(new Headers({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }))).toBe(
      "198.51.100.2"
    );
    expect(extractClientIp(new Headers())).toBe("unknown");
  });
});
