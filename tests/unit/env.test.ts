// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import { register } from "../../instrumentation";
import configure from "../../next.config";

vi.mock("server-only", () => ({}));

describe("server environment", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("APP_URL", undefined);
    vi.stubEnv("ADS_ENABLED", undefined);
    vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("loads the default app URL and keeps ads disabled", async () => {
    const { env } = await import("../../src/shared/env");

    expect(env.APP_URL).toBe("https://amigo-secreto-app.vercel.app");
    expect(env.ADS_ENABLED).toBe(false);
    expect(env.SUPABASE_URL).toBe("http://127.0.0.1:54321");
  });

  it("accepts an explicit app URL and turns ads on", async () => {
    vi.stubEnv("APP_URL", "http://localhost:3000");
    vi.stubEnv("ADS_ENABLED", "true");

    const { env } = await import("../../src/shared/env");

    expect(env.APP_URL).toBe("http://localhost:3000");
    expect(env.ADS_ENABLED).toBe(true);
  });

  it.each(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])(
    "fails startup when %s is missing",
    async (key) => {
      vi.stubEnv(key, undefined);

      await expect(register()).rejects.toThrow(`Missing or invalid environment variables: ${key}`);
    }
  );

  it("blocks Next.js startup when configuration is missing but allows the build", () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);

    expect(() => configure(PHASE_PRODUCTION_SERVER)).toThrow(
      "Missing or invalid environment variables: SUPABASE_SERVICE_ROLE_KEY"
    );
    expect(() => configure(PHASE_PRODUCTION_BUILD)).not.toThrow();
  });

  it("rejects malformed configuration at startup without echoing input", async () => {
    vi.stubEnv("APP_URL", "file:///test-configuration");
    vi.stubEnv("ADS_ENABLED", "yes");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", " ");

    await expect(register()).rejects.toThrow(
      /^Missing or invalid environment variables: APP_URL, SUPABASE_SERVICE_ROLE_KEY, ADS_ENABLED$/
    );
  });
});
