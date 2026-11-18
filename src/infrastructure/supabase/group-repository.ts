import { err, ok } from "../../shared/result";
import type {
  AdminScope,
  DrawState,
  GroupRepository,
  GroupStatus,
  NewGroup,
  ParticipantId,
  PublicGroup,
} from "../../application/ports";
import type { ServerSupabaseClient } from "./client";
import { mapRpcError } from "./rpc-error";

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

async function readDrawState(
  client: ServerSupabaseClient,
  groupId: string,
  status: string
): Promise<DrawState> {
  if (status !== "drawn") return { status: "open" };
  const { data } = await client
    .from("draws")
    .select("created_at")
    .eq("group_id", groupId)
    .is("invalidated_at", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? { status: "drawn", drawnAt: data.created_at } : { status: "open" };
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

    async findAdminByHash(hash: string): Promise<AdminScope | null> {
      const { data, error } = await client
        .from("groups")
        .select("id, admin_token_hash, expires_at")
        .eq("admin_token_hash", hash)
        .maybeSingle();
      if (error || !data) return null;
      if (new Date(data.expires_at).getTime() <= Date.now()) return null;
      return { groupId: data.id, adminTokenHash: data.admin_token_hash };
    },

    async getAdminView(admin: AdminScope) {
      const { data: group, error } = await client
        .from("groups")
        .select(
          "id, name, max_value_cents, exchange_date, location, status, invite_token, admin_token_hash, expires_at"
        )
        .eq("id", admin.groupId)
        .eq("admin_token_hash", admin.adminTokenHash)
        .maybeSingle();
      if (error || !group) return err({ code: "INVALID_LINK" });
      if (new Date(group.expires_at).getTime() <= Date.now()) {
        return err({ code: "INVALID_LINK" });
      }

      const { data: participants, error: participantsError } = await client
        .from("participants")
        .select("id, display_name, joined_at")
        .eq("group_id", admin.groupId)
        .is("removed_at", null)
        .order("joined_at", { ascending: true });
      if (participantsError) return err({ code: "INVALID_LINK" });

      const active = participants ?? [];
      return ok({
        group: {
          name: group.name,
          maxValueCents: group.max_value_cents,
          exchangeDate: group.exchange_date,
          location: group.location,
        },
        inviteUrl: `/g/${group.invite_token}`,
        draw: await readDrawState(client, admin.groupId, group.status),
        participantCount: active.length,
        participants: active.map((p) => ({
          id: p.id,
          displayName: p.display_name,
          joinedAt: p.joined_at,
        })),
      });
    },

    async removeParticipant(admin: AdminScope, participantId: ParticipantId) {
      const { data: group, error } = await client
        .from("groups")
        .select("id, status, admin_token_hash, expires_at")
        .eq("id", admin.groupId)
        .eq("admin_token_hash", admin.adminTokenHash)
        .maybeSingle();
      if (error || !group) return err({ code: "INVALID_LINK" });
      if (new Date(group.expires_at).getTime() <= Date.now()) {
        return err({ code: "INVALID_LINK" });
      }
      if (group.status !== "open") return err({ code: "GROUP_CLOSED" });

      const { data: participant, error: findError } = await client
        .from("participants")
        .select("id")
        .eq("id", participantId)
        .eq("group_id", admin.groupId)
        .is("removed_at", null)
        .maybeSingle();
      if (findError) return err({ code: "INVALID_LINK" });
      if (!participant) return err({ code: "PARTICIPANT_NOT_FOUND" });

      const removedAt = new Date().toISOString();
      const { error: updateError } = await client
        .from("participants")
        .update({ removed_at: removedAt })
        .eq("id", participantId)
        .eq("group_id", admin.groupId)
        .is("removed_at", null);
      if (updateError) {
        const mapped = mapRpcError(updateError);
        return err({ code: mapped.code === "GROUP_CLOSED" ? "GROUP_CLOSED" : "INVALID_LINK" });
      }

      const count = await countActiveParticipants(client, admin.groupId);
      return ok({ participantCount: count });
    },
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
