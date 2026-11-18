import { err, ok } from "../../shared/result";
import type {
  AccessScope,
  AdminScope,
  DrawRepository,
  Pair,
  ParticipantId,
  RevealedResult,
} from "../../application/ports";
import type { ServerSupabaseClient } from "./client";
import { mapRpcError } from "./rpc-error";
import { toProductLink } from "./wish-mappers";

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

type SnapshotWishRow = {
  id: string;
  title: string;
  url: string | null;
  note: string | null;
  affiliate_url: string | null;
  store: string | null;
  created_at: string;
};

type SnapshotPairRow = {
  draw: { id: string; version: number; invalidated_at: string | null } | null;
  receiver: {
    id: string;
    display_name: string;
    removed_at: string | null;
    wish_items: SnapshotWishRow[] | null;
  } | null;
};

type SnapshotGiverRow = {
  id: string;
  access_token_hash: string;
  removed_at: string | null;
  group: { id: string; status: string; expires_at: string } | null;
  given_pairs: SnapshotPairRow[] | null;
};

const SINGLE_SNAPSHOT_RESULT_SELECT = [
  "id,",
  "access_token_hash,",
  "removed_at,",
  "group:groups!participants_group_id_fkey(id, status, expires_at),",
  "given_pairs:pairs!pairs_group_id_giver_id_fkey(",
  "draw:draws!pairs_group_id_draw_id_fkey(id, version, invalidated_at),",
  "receiver:participants!pairs_group_id_receiver_id_fkey(",
  "id, display_name, removed_at,",
  "wish_items!wish_items_participant_id_fkey(id, title, url, note, affiliate_url, store, created_at)",
  "))",
].join("");

function hasMatchingGivers(expectedIds: readonly ParticipantId[], pairs: readonly Pair[]): boolean {
  if (pairs.length !== expectedIds.length) return false;
  const expectedSet = new Set(expectedIds);
  if (expectedSet.size !== expectedIds.length) return false;
  return pairs.every((pair) => expectedSet.has(pair.giverId));
}

function isActivePair(pair: SnapshotPairRow): pair is {
  draw: NonNullable<SnapshotPairRow["draw"]>;
  receiver: NonNullable<SnapshotPairRow["receiver"]>;
} {
  if (!pair.draw || pair.draw.invalidated_at !== null) return false;
  return Boolean(pair.receiver && pair.receiver.removed_at === null);
}

function mapSnapshotToResult(giver: SnapshotGiverRow | null) {
  if (!giver || giver.removed_at !== null || !giver.group) {
    return err({ code: "INVALID_LINK" as const });
  }
  if (new Date(giver.group.expires_at).getTime() <= Date.now()) {
    return err({ code: "INVALID_LINK" as const });
  }
  if (giver.group.status !== "drawn") {
    return err({ code: "DRAW_NOT_READY" as const });
  }

  const validPairs = (giver.given_pairs ?? []).filter(isActivePair);
  validPairs.sort((a, b) => b.draw.version - a.draw.version);
  const active = validPairs[0];
  if (!active) return err({ code: "DRAW_NOT_READY" as const });

  const wishes = [...(active.receiver.wish_items ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const value: RevealedResult = {
    drawVersion: active.draw.version,
    recipientName: active.receiver.display_name,
    wishItems: wishes.map((row) => ({
      id: row.id,
      title: row.title,
      note: row.note,
      productLink: toProductLink(row),
    })),
  };
  return ok(value);
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

    async getCurrentResult(access: AccessScope) {
      const { data, error } = await client
        .from("participants")
        .select(SINGLE_SNAPSHOT_RESULT_SELECT)
        .eq("id", access.participantId)
        .eq("access_token_hash", access.accessTokenHash)
        .is("removed_at", null)
        .maybeSingle();
      if (error) return err({ code: "INVALID_LINK" });
      return mapSnapshotToResult(data as unknown as SnapshotGiverRow | null);
    },
  };
}
