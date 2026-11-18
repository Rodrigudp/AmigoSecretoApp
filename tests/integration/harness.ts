import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import type { ServerSupabaseClient } from "../../src/infrastructure/supabase/client";

vi.mock("server-only", () => ({}));

const TABLES_IN_DELETE_ORDER = [
  "pairs",
  "draws",
  "wish_items",
  "events",
  "participants",
  "groups",
] as const;

export function hasIntegrationEnv(
  source: Record<string, string | undefined> = process.env
): boolean {
  const url = source.SUPABASE_URL?.trim() ?? "";
  const key = source.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  return url.length > 0 && key.length > 0;
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

export async function probeIntegrationDatabase(
  source: Record<string, string | undefined> = process.env
): Promise<{ available: boolean; client: ServerSupabaseClient | null }> {
  if (!hasIntegrationEnv(source)) {
    console.warn(
      "[integration] Skipping suite: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set."
    );
    return { available: false, client: null };
  }

  try {
    const client = await createIntegrationClient();
    const { error } = await client.from("groups").select("id", { head: true, count: "exact" });
    if (error) {
      console.warn(`[integration] Skipping suite: local Supabase responded with ${error.message}.`);
      return { available: false, client: null };
    }
    return { available: true, client };
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : "unknown error";
    console.warn(`[integration] Skipping suite: local Supabase is unreachable (${reason}).`);
    return { available: false, client: null };
  }
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
