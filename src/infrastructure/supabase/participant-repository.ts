import { err, ok } from "../../shared/result";
import type {
  AccessScope,
  GroupStatus,
  ParticipantRepository,
  ParticipantView,
  ProductLink,
  WishItem,
} from "../../application/ports";
import type { ServerSupabaseClient } from "./client";
import { mapRpcError } from "./rpc-error";

function toProductLink(row: {
  url: string | null;
  affiliate_url: string | null;
  store: string | null;
}): ProductLink | null {
  if (row.affiliate_url && row.store === "amazon") {
    return { href: row.affiliate_url, affiliate: true, store: "amazon" };
  }
  if (row.url) return { href: row.url, affiliate: false, store: null };
  return null;
}

function toWishItem(row: {
  id: string;
  title: string;
  url: string | null;
  note: string | null;
  affiliate_url: string | null;
  store: string | null;
}): WishItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    note: row.note,
    productLink: toProductLink(row),
  };
}

export function createParticipantRepository(client: ServerSupabaseClient): ParticipantRepository {
  return {
    async join(input) {
      const { data, error } = await client.rpc("join_group", {
        p_invite_token: input.inviteToken,
        p_display_name: input.displayName,
        p_access_token_hash: input.accessTokenHash,
      });
      if (error) return err(mapRpcError(error));
      const row = data?.[0];
      if (!row) return err({ code: "INVALID_INPUT" });
      return ok({
        displayName: row.display_name,
        groupId: row.group_id,
        expiresAt: row.expires_at,
      });
    },

    async findActiveByHash(hash: string) {
      const { data: participant, error } = await client
        .from("participants")
        .select("id, access_token_hash, display_name, group_id")
        .eq("access_token_hash", hash)
        .is("removed_at", null)
        .maybeSingle();
      if (error || !participant) return null;

      const { data: group } = await client
        .from("groups")
        .select("expires_at")
        .eq("id", participant.group_id)
        .maybeSingle();
      if (!group || new Date(group.expires_at).getTime() <= Date.now()) return null;

      return {
        participantId: participant.id,
        accessTokenHash: participant.access_token_hash,
        groupId: participant.group_id,
        displayName: participant.display_name,
        expiresAt: group.expires_at,
      };
    },

    async getView(access: AccessScope) {
      const { data: participant, error } = await client
        .from("participants")
        .select("id, display_name, access_token_hash, group_id")
        .eq("id", access.participantId)
        .eq("access_token_hash", access.accessTokenHash)
        .is("removed_at", null)
        .maybeSingle();
      if (error || !participant) return err({ code: "INVALID_LINK" });

      const { data: group } = await client
        .from("groups")
        .select("name, max_value_cents, exchange_date, location, status, expires_at")
        .eq("id", participant.group_id)
        .maybeSingle();
      if (!group || new Date(group.expires_at).getTime() <= Date.now()) {
        return err({ code: "INVALID_LINK" });
      }

      const { data: wishRows, error: wishError } = await client
        .from("wish_items")
        .select("id, title, url, note, affiliate_url, store")
        .eq("participant_id", access.participantId)
        .order("created_at", { ascending: true });
      if (wishError) return err({ code: "INVALID_LINK" });

      const view: ParticipantView = {
        displayName: participant.display_name,
        group: {
          name: group.name,
          maxValueCents: group.max_value_cents,
          exchangeDate: group.exchange_date,
          location: group.location,
          status: group.status as GroupStatus,
        },
        ownWishItems: (wishRows ?? []).map(toWishItem),
      };
      return ok(view);
    },
  };
}
