import { err, ok } from "../../shared/result";
import type { GroupRepository, GroupStatus, NewGroup, PublicGroup } from "../../application/ports";
import type { ServerSupabaseClient } from "./client";
import { mapRpcError } from "./rpc-error";

function notInBe02(): never {
  throw new Error("Not implemented in BE-02");
}

function toPublicGroup(row: {
  name: string;
  max_value_cents: number;
  exchange_date: string;
  location: string | null;
  status: string;
}): PublicGroup {
  return {
    name: row.name,
    maxValueCents: row.max_value_cents,
    exchangeDate: row.exchange_date,
    location: row.location,
    status: row.status as GroupStatus,
  };
}

export function createGroupRepository(client: ServerSupabaseClient): GroupRepository {
  return {
    async createOrRotateAdminToken(input: NewGroup) {
      const { data, error } = await client.rpc("create_group_once", {
        p_request_id: input.requestId,
        p_name: input.name,
        p_max_value_cents: input.maxValueCents,
        p_exchange_date: input.exchangeDate,
        p_location: input.location as string,
        p_invite_token: input.inviteToken,
        p_admin_token_hash: input.adminTokenHash,
        p_expires_at: input.expiresAt,
      });
      if (error) return err(mapRpcError(error));
      const row = data?.[0];
      if (!row) return err({ code: "INVALID_INPUT" });
      return ok({ groupId: row.group_id, inviteToken: row.invite_token });
    },

    async findByInvite(token: string) {
      const { data, error } = await client
        .from("groups")
        .select("id, name, max_value_cents, exchange_date, location, status, expires_at")
        .eq("invite_token", token)
        .maybeSingle();
      if (error || !data) return null;
      if (new Date(data.expires_at).getTime() <= Date.now()) return null;
      return { groupId: data.id, view: toPublicGroup(data) };
    },

    findAdminByHash: notInBe02,
    getAdminView: notInBe02,
    removeParticipant: notInBe02,
  };
}

export async function countActiveParticipants(
  client: ServerSupabaseClient,
  groupId: string
): Promise<number> {
  const { count, error } = await client
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId)
    .is("removed_at", null);
  if (error) throw new Error(`Failed to count participants: ${error.message}`);
  return count ?? 0;
}

export async function recordInviteOpened(
  client: ServerSupabaseClient,
  groupId: string
): Promise<void> {
  await client.from("events").insert({ group_id: groupId, type: "invite_opened" });
}

export async function findReturningDisplayName(
  client: ServerSupabaseClient,
  groupId: string,
  accessTokenHash: string
): Promise<string | null> {
  const { data } = await client
    .from("participants")
    .select("display_name")
    .eq("group_id", groupId)
    .eq("access_token_hash", accessTokenHash)
    .is("removed_at", null)
    .maybeSingle();
  return data?.display_name ?? null;
}

export async function readGroupExpiresAt(
  client: ServerSupabaseClient,
  groupId: string
): Promise<string | null> {
  const { data } = await client.from("groups").select("expires_at").eq("id", groupId).maybeSingle();
  return data?.expires_at ?? null;
}
