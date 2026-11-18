// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } from "next/constants";
import { buildContentSecurityPolicy } from "../../src/infrastructure/security-headers";
import configure from "../../next.config";

describe("security headers (SEC-03)", () => {
  it("excludes AdSense origins and unsafe-eval from CSP when ads are disabled", () => {
    const csp = buildContentSecurityPolicy({ adsEnabled: false, isDev: false });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("googlesyndication");
  });

  it("allows AdSense origins in CSP when ads are enabled", () => {
    const csp = buildContentSecurityPolicy({ adsEnabled: true, isDev: false });
    expect(csp).toContain("https://pagead2.googlesyndication.com");
    expect(csp).toContain("https://googleads.g.doubleclick.net");
    expect(csp).not.toContain("frame-src 'none'");
  });

  it("configures global HSTS/CSP and sensitive-route no-referrer/noindex headers", async () => {
    vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("ADS_ENABLED", "false");

    const rules = (await configure(PHASE_PRODUCTION_SERVER).headers?.()) ?? [];
    const globalHeaders = rules.find((rule) => rule.source === "/:path*")?.headers ?? [];
    expect(globalHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "X-Content-Type-Options", value: "nosniff" }),
        expect.objectContaining({ key: "X-Frame-Options", value: "DENY" }),
        expect.objectContaining({ key: "Strict-Transport-Security" }),
      ])
    );
    for (const source of [
      "/g/:path*",
      "/p/:path*",
      "/admin/:path*",
      "/r/:path*",
      "/owner/:path*",
    ]) {
      const headers = rules.find((item) => item.source === source)?.headers ?? [];
      expect(headers).toEqual(
        expect.arrayContaining([
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ])
      );
    }

    vi.unstubAllEnvs();
  });

  it("includes unsafe-eval in development server CSP only", async () => {
    vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    const devRules = (await configure(PHASE_DEVELOPMENT_SERVER).headers?.()) ?? [];
    expect(devRules[0].headers.find((h) => h.key === "Content-Security-Policy")?.value).toContain(
      "'unsafe-eval'"
    );
    vi.unstubAllEnvs();
  });
});
