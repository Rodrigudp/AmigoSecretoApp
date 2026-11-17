/**
 * Database types for the Supabase schema (supabase/migrations).
 *
 * TECH DEBT (DB-01): written by hand from the migrations because no local Supabase/Docker is available.
 * Regenerate with `supabase gen types typescript --local > src/infrastructure/supabase/types.ts`
 * as soon as the CI `db` job publishes it, and keep this header out of the generated file.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          name: string;
          max_value_cents: number;
          /** Calendar day, `YYYY-MM-DD`. */
          exchange_date: string;
          location: string | null;
          /** SHA-256 hex of the admin token. */
          admin_token_hash: string;
          invite_token: string;
          status: "open" | "drawn";
          draw_version: number;
          created_at: string;
          /** exchange_date + 60 days (RN08). */
          expires_at: string;
          /** Client UUID v4 used for create-group idempotency. */
          create_request_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          max_value_cents: number;
          exchange_date: string;
          location?: string | null;
          admin_token_hash: string;
          invite_token: string;
          status?: "open" | "drawn";
          draw_version?: number;
          created_at?: string;
          expires_at: string;
          create_request_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["groups"]["Insert"]>;
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          group_id: string;
          display_name: string;
          /** SHA-256 hex of the personal access token. */
          access_token_hash: string;
          joined_at: string;
          removed_at: string | null;
        };
        Insert: {
          id?: string;
          group_id: string;
          display_name: string;
          access_token_hash: string;
          joined_at?: string;
          removed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["participants"]["Insert"]>;
        Relationships: [];
      };
      wish_items: {
        Row: {
          id: string;
          participant_id: string;
          title: string;
          url: string | null;
          affiliate_url: string | null;
          note: string | null;
          /** `null` = plain link (no affiliate badge). */
          store: "amazon" | "mercadolivre" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          title: string;
          url?: string | null;
          affiliate_url?: string | null;
          note?: string | null;
          store?: "amazon" | "mercadolivre" | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wish_items"]["Insert"]>;
        Relationships: [];
      };
      draws: {
        Row: {
          id: string;
          group_id: string;
          version: number;
          created_at: string;
          invalidated_at: string | null;
        };
        Insert: {
          id?: string;
          group_id: string;
          version: number;
          created_at?: string;
          invalidated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["draws"]["Insert"]>;
        Relationships: [];
      };
      pairs: {
        Row: {
          group_id: string;
          draw_id: string;
          giver_id: string;
          receiver_id: string;
        };
        Insert: {
          group_id: string;
          draw_id: string;
          giver_id: string;
          receiver_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["pairs"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          /** Null after the group is purged (RN08). */
          group_id: string | null;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id?: string | null;
          type: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
