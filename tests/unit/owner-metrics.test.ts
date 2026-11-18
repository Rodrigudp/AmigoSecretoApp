// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/src/infrastructure/supabase/client", () => ({
  createServerClient: vi.fn(),
}));

import { authorized, metrics } from "../../app/owner/metrics";
import { GET } from "../../app/owner/route";
import {
  DEFAULT_RATE_LIMIT_POLICIES,
  getSharedRateLimiter,
} from "../../src/infrastructure/rate-limit";

describe("owner metrics", () => {
  beforeEach(() => {
    getSharedRateLimiter().reset();
  });

  it("requires a configured strong secret and valid Basic credentials", () => {
    const secret = "x".repeat(32);
    const auth = (password: string) =>
      `Basic ${Buffer.from(`owner:${password}`).toString("base64")}`;
    expect(authorized(auth(secret), secret)).toBe(true);
    expect(authorized(auth("wrong"), secret)).toBe(false);
    expect(authorized(auth(""), undefined)).toBe(false);
    expect(authorized(auth("weak"), "weak")).toBe(false);
  });

  it("calculates global ratios and handles missing denominators", () => {
    expect(metrics(2, 10, 5)).toEqual({ joins: 10, perGroup: "5", perJoin: "0,5" });
    expect(metrics(0, 0, 0)).toEqual({
      joins: 0,
      perGroup: "Indisponível",
      perJoin: "Indisponível",
    });
  });

  it("rate limits /owner requests per IP after 10 attempts in 10 minutes (SEC05-B01)", async () => {
    const makeReq = () =>
      new Request("https://papelzinho.app/owner", {
        headers: { "x-real-ip": "203.0.113.55" },
      });
    for (let i = 0; i < DEFAULT_RATE_LIMIT_POLICIES.owner_auth.limit; i += 1) {
      const res = await GET(makeReq());
      expect(res.status).toBe(401);
    }
    const blocked = await GET(makeReq());
    expect(blocked.status).toBe(429);
  });
});
