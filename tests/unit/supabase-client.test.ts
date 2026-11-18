// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const createClientSpy = vi.fn(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientSpy,
}));

describe("Supabase server client and integration harness (BE-01)", () => {
  beforeEach(() => {
    vi.resetModules();
    createClientSpy.mockClear();
    vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("creates a typed server client using the service role without persisted sessions", async () => {
    const { createServerClient } = await import("../../src/infrastructure/supabase/client");
    createServerClient();

    expect(createClientSpy).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "test-service-role-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  });

  it("skips integration probing with a clear warning when Supabase env variables are absent", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { probeIntegrationDatabase } = await import("../integration/harness");

    const result = await probeIntegrationDatabase({});

    expect(result).toEqual({ available: false, client: null });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Skipping suite: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    );
  });
});
