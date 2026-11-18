import { err, ok } from "../../shared/result";
import type {
  AccessScope,
  StoredWishFields,
  WishItemId,
  WishItemRepository,
} from "../../application/ports";
import type { ServerSupabaseClient } from "./client";
import { logInfraError } from "./log-infra-error";
import { toWishItem } from "./wish-mappers";

const MAX_WISH_ITEMS = 20;

async function assertActiveAccess(
  client: ServerSupabaseClient,
  access: AccessScope
): Promise<boolean> {
  const { data, error } = await client
    .from("participants")
    .select("id")
    .eq("id", access.participantId)
    .eq("access_token_hash", access.accessTokenHash)
    .is("removed_at", null)
    .maybeSingle();
  if (error) {
    logInfraError("wish.assertActiveAccess", error);
    return false;
  }
  return Boolean(data);
}

async function countOwnItems(
  client: ServerSupabaseClient,
  participantId: string
): Promise<number | null> {
  const { count, error } = await client
    .from("wish_items")
    .select("id", { count: "exact", head: true })
    .eq("participant_id", participantId);
  if (error) {
    logInfraError("wish.countOwnItems", error);
    return null;
  }
  return count ?? 0;
}

export function createWishItemRepository(client: ServerSupabaseClient): WishItemRepository {
  return {
    async listOwn(access) {
      if (!(await assertActiveAccess(client, access))) {
        return err({ code: "INVALID_LINK" });
      }
      const { data, error } = await client
        .from("wish_items")
        .select("id, title, url, note, affiliate_url, store")
        .eq("participant_id", access.participantId)
        .order("created_at", { ascending: true });
      if (error) {
        logInfraError("wish.listOwn", error);
        return err({ code: "INVALID_LINK" });
      }
      return ok((data ?? []).map(toWishItem));
    },

    async addOwn(access, item: StoredWishFields) {
      if (!(await assertActiveAccess(client, access))) {
        return err({ code: "INVALID_LINK" });
      }
      const count = await countOwnItems(client, access.participantId);
      if (count === null) return err({ code: "INVALID_LINK" });
      if (count >= MAX_WISH_ITEMS) return err({ code: "WISH_LIST_FULL" });

      const { data, error } = await client
        .from("wish_items")
        .insert({
          participant_id: access.participantId,
          title: item.title,
          url: item.url,
          note: item.note,
          affiliate_url: item.affiliateUrl,
          store: item.store,
        })
        .select("id, title, url, note, affiliate_url, store")
        .single();
      if (error) {
        // Trigger / race on the 21st item.
        if (error.message?.includes("WISH_LIST_FULL")) {
          return err({ code: "WISH_LIST_FULL" });
        }
        logInfraError("wish.addOwn", error);
        return err({ code: "INVALID_LINK" });
      }
      return ok(toWishItem(data));
    },

    async updateOwn(access, itemId: WishItemId, item: StoredWishFields) {
      if (!(await assertActiveAccess(client, access))) {
        return err({ code: "INVALID_LINK" });
      }
      const { data, error } = await client
        .from("wish_items")
        .update({
          title: item.title,
          url: item.url,
          note: item.note,
          affiliate_url: item.affiliateUrl,
          store: item.store,
        })
        .eq("id", itemId)
        .eq("participant_id", access.participantId)
        .select("id, title, url, note, affiliate_url, store")
        .maybeSingle();
      if (error) {
        logInfraError("wish.updateOwn", error);
        return err({ code: "INVALID_LINK" });
      }
      if (!data) return err({ code: "WISH_ITEM_NOT_FOUND" });
      return ok(toWishItem(data));
    },

    async deleteOwn(access, itemId: WishItemId) {
      if (!(await assertActiveAccess(client, access))) {
        return err({ code: "INVALID_LINK" });
      }
      const { data, error } = await client
        .from("wish_items")
        .delete()
        .eq("id", itemId)
        .eq("participant_id", access.participantId)
        .select("id")
        .maybeSingle();
      if (error) {
        logInfraError("wish.deleteOwn", error);
        return err({ code: "INVALID_LINK" });
      }
      if (!data) return err({ code: "WISH_ITEM_NOT_FOUND" });
      return ok({ id: data.id });
    },

    async getVisibleLink(access, itemId: WishItemId) {
      if (!(await assertActiveAccess(client, access))) {
        return err({ code: "INVALID_LINK" });
      }
      const { data: own, error } = await client
        .from("wish_items")
        .select("id, url, affiliate_url, participant_id")
        .eq("id", itemId)
        .eq("participant_id", access.participantId)
        .maybeSingle();
      if (error) {
        logInfraError("wish.getVisibleLink", error);
        return err({ code: "INVALID_LINK" });
      }
      if (!own) return err({ code: "WISH_ITEM_NOT_FOUND" });
      if (!own.url && !own.affiliate_url) {
        return err({ code: "PRODUCT_LINK_UNAVAILABLE" });
      }

      const { data: participant, error: participantError } = await client
        .from("participants")
        .select("group_id")
        .eq("id", access.participantId)
        .maybeSingle();
      if (participantError) {
        logInfraError("wish.getVisibleLink.group", participantError);
        return err({ code: "INVALID_LINK" });
      }
      if (!participant) return err({ code: "INVALID_LINK" });

      return ok({
        groupId: participant.group_id,
        url: own.url ?? own.affiliate_url!,
        affiliateUrl: own.affiliate_url,
      });
    },
  };
}

/** Test/helper: how many wish items the participant currently owns. */
export async function countWishItemsForParticipant(
  client: ServerSupabaseClient,
  participantId: string
): Promise<number> {
  const count = await countOwnItems(client, participantId);
  if (count === null) throw new Error("Failed to count wish items");
  return count;
}
