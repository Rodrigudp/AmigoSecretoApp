import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import type { ServerSupabaseClient } from "../../src/infrastructure/supabase/client";

vi.mock("server-only", () => ({}));

/**
 * `draws`, `pairs`, `participants`, and `wish_items` cascade from `groups`.
 * `events.group_id` uses `ON DELETE SET NULL`, so `events` is deleted first.
 */
const TABLES_IN_DELETE_ORDER = ["events", "groups"] as const;
const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function hasIntegrationEnv(
  source: Record<string, string | undefined> = process.env
): boolean {
  const url = source.SUPABASE_URL?.trim() ?? "";
  const key = source.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  return url.length > 0 && key.length > 0;
}

export function isAllowedIntegrationUrl(rawUrl: string, allowRemote?: string): boolean {
  if (allowRemote === "1") {
    return true;
  }
  try {
    const parsed = new URL(rawUrl);
    return LOCAL_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export async function createIntegrationClient(): Promise<ServerSupabaseClient> {
  const { createServerClient } = await import("../../src/infrastructure/supabase/client");
  return createServerClient();
}

export async function resetDatabase(client: ServerSupabaseClient): Promise<void> {
  for (const table of TABLES_IN_DELETE_ORDER) {
    const { error } = await client.from(table).delete().not("id", "is", null);
    if (error) {
      throw new Error(`Failed to clean table "${table}": ${error.message}`);
    }
  }
}

function isIntegrationRequired(source: Record<string, string | undefined>): boolean {
  return source.INTEGRATION_REQUIRED === "1";
}

function formatProbeError(
  error: { code?: string; message?: string; details?: string; hint?: string },
  status?: number
): string {
  return [
    `code=${error.code ?? "n/a"}`,
    `message=${error.message ?? ""}`,
    `details=${error.details ?? ""}`,
    `hint=${error.hint ?? ""}`,
    `status=${status ?? "n/a"}`,
  ].join(" ");
}

function skipOrThrow(
  reason: string,
  source: Record<string, string | undefined>
): { available: false; client: null } {
  const message = `[integration] ${reason}`;
  if (isIntegrationRequired(source)) {
    throw new Error(message);
  }
  console.warn(`${message} Skipping suite.`);
  return { available: false, client: null };
}

async function probeLocalSupabase(
  source: Record<string, string | undefined>
): Promise<{ available: true; client: ServerSupabaseClient } | { available: false; client: null }> {
  try {
    const client = await createIntegrationClient();
    const { error, status } = await client.from("groups").select("id").limit(1);
    if (error) {
      const details = formatProbeError(error, status);
      console.error(`[integration] Probe failed: ${details}`);
      return skipOrThrow(`local Supabase responded with ${details}.`, source);
    }
    return { available: true, client };
  } catch (cause) {
    if (cause instanceof Error && cause.message.startsWith("[integration]")) {
      throw cause;
    }
    const reason = cause instanceof Error ? cause.message : "unknown error";
    return skipOrThrow(`local Supabase is unreachable (${reason}).`, source);
  }
}

export async function probeIntegrationDatabase(
  source: Record<string, string | undefined> = process.env
): Promise<{ available: boolean; client: ServerSupabaseClient | null }> {
  if (!hasIntegrationEnv(source)) {
    return skipOrThrow(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set.",
      source
    );
  }

  if (!isAllowedIntegrationUrl(source.SUPABASE_URL ?? "", source.INTEGRATION_ALLOW_REMOTE)) {
    return skipOrThrow(
      "SUPABASE_URL must point to 127.0.0.1/localhost (or set INTEGRATION_ALLOW_REMOTE=1).",
      source
    );
  }

  return probeLocalSupabase(source);
}

export function useIntegrationDatabase() {
  let state: { available: boolean; client: ServerSupabaseClient | null } = {
    available: false,
    client: null,
  };

  beforeAll(async () => {
    state = await probeIntegrationDatabase();
  });

  beforeEach(async (context) => {
    if (!state.available || !state.client) {
      context.skip();
      return;
    }
    await resetDatabase(state.client);
  });

  afterAll(async () => {
    if (state.available && state.client) {
      await resetDatabase(state.client);
    }
  });

  return {
    get available(): boolean {
      return state.available;
    },
    get db(): ServerSupabaseClient {
      if (!state.client) {
        throw new Error("Integration Supabase client is not available.");
      }
      return state.client;
    },
  };
}
