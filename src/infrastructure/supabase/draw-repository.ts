import { err, ok } from "../../shared/result";
import type { AdminScope, DrawRepository, Pair, ParticipantId } from "../../application/ports";
import type { ServerSupabaseClient } from "./client";
import { mapRpcError } from "./rpc-error";

type RunDrawRpcArgs = {
  p_group_id: string;
  p_admin_token_hash: string;
  p_expected_version: number;
  p_givers: string[];
  p_receivers: string[];
};

type RunDrawRpcRow = {
  draw_version: number;
  status: string;
  drawn_at: string;
  was_replay: boolean;
};

type RunDrawRpcClient = {
  rpc(
    fn: "run_draw",
    args: RunDrawRpcArgs
  ): PromiseLike<{ data: RunDrawRpcRow[] | null; error: { message?: string } | null }>;
};

function hasMatchingGivers(expectedIds: readonly ParticipantId[], pairs: readonly Pair[]): boolean {
  if (pairs.length !== expectedIds.length) return false;
  const expectedSet = new Set(expectedIds);
  if (expectedSet.size !== expectedIds.length) return false;
  return pairs.every((pair) => expectedSet.has(pair.giverId));
}

export function createDrawRepository(client: ServerSupabaseClient): DrawRepository {
  const rpcClient = client as unknown as RunDrawRpcClient;

  return {
    async readForFirstDraw(admin: AdminScope) {
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

      if (group.status === "drawn") {
        const { data: draw, error: drawError } = await client
          .from("draws")
          .select("created_at")
          .eq("group_id", admin.groupId)
          .is("invalidated_at", null)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (drawError || !draw) return err({ code: "DRAW_NOT_READY" });
        return ok({ status: "drawn", drawnAt: draw.created_at });
      }

      const { data: participants, error: participantsError } = await client
        .from("participants")
        .select("id")
        .eq("group_id", admin.groupId)
        .is("removed_at", null)
        .order("joined_at", { ascending: true });
      if (participantsError) return err({ code: "INVALID_LINK" });

      return ok({
        status: "open",
        participantIds: (participants ?? []).map((p) => p.id),
      });
    },

    async commitFirstDraw(admin, expectedParticipantIds, pairs) {
      if (!hasMatchingGivers(expectedParticipantIds, pairs)) {
        return err({ code: "INVALID_INPUT" });
      }

      const { data, error } = await rpcClient.rpc("run_draw", {
        p_group_id: admin.groupId,
        p_admin_token_hash: admin.adminTokenHash,
        p_expected_version: 0,
        p_givers: pairs.map((pair) => pair.giverId),
        p_receivers: pairs.map((pair) => pair.receiverId),
      });
      if (error) return err(mapRpcError(error));
      const row = data?.[0];
      if (!row) return err({ code: "INVALID_INPUT" });
      return ok({ status: "drawn", drawnAt: row.drawn_at });
    },

    async getCurrentResult() {
      return err({ code: "DRAW_NOT_READY" });
    },
  };
}
