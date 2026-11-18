import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../shared/env";
import type { Database } from "./types";

export type ServerSupabaseClient = SupabaseClient<Database>;

export function createServerClient(): ServerSupabaseClient {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
