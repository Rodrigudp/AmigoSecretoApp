"use server";

import { addWishItem } from "@/src/application/add-wish-item";
import { updateWishItem } from "@/src/application/update-wish-item";
import { removeWishItem } from "@/src/application/remove-wish-item";
import { listWishItems } from "@/src/application/list-wish-items";
import type { WishItem, SaveWishItemOutput } from "@/src/application/ports";
import { copy } from "./_lib/copy";

export type AddWishItemActionResult =
  { ok: true; output: SaveWishItemOutput } | { ok: false; message: string; code?: string };

export type UpdateWishItemActionResult =
  { ok: true; output: SaveWishItemOutput } | { ok: false; message: string; code?: string };

export type RemoveWishItemActionResult =
  { ok: true } | { ok: false; message: string; code?: string };

export type ListWishItemsActionResult =
  { ok: true; items: WishItem[] } | { ok: false; message: string; code?: string };

async function getDeps() {
  const { buildWishItemRepository, buildParticipantViewDeps, buildAffiliateLinkService } =
    await import("@/src/infrastructure/supabase/deps");
  const partDeps = buildParticipantViewDeps();
  const wishRepo = buildWishItemRepository();
  const affiliate = buildAffiliateLinkService();
  return {
    participants: partDeps.participants,
    wishItems: wishRepo,
    tokens: partDeps.tokens,
    affiliate,
  };
}

export async function addWishItemAction(
  accessToken: string,
  fields: { title: string; url?: string | null; note?: string | null }
): Promise<AddWishItemActionResult> {
  try {
    const deps = await getDeps();
    const result = await addWishItem(
      { accessToken, title: fields.title, url: fields.url, note: fields.note },
      deps
    );
    if (!result.ok) {
      if (result.error.code === "WISH_LIST_FULL") {
        return { ok: false, message: copy.WSH_06, code: "WISH_LIST_FULL" };
      }
      return { ok: false, message: copy.WSH_22.saveError, code: result.error.code };
    }
    return { ok: true, output: result.value };
  } catch {
    return { ok: false, message: copy.GLB_08 };
  }
}

export async function updateWishItemAction(
  accessToken: string,
  itemId: string,
  fields: { title: string; url?: string | null; note?: string | null }
): Promise<UpdateWishItemActionResult> {
  try {
    const deps = await getDeps();
    const result = await updateWishItem(
      { accessToken, itemId, title: fields.title, url: fields.url, note: fields.note },
      deps
    );
    if (!result.ok) {
      if (result.error.code === "WISH_ITEM_NOT_FOUND") {
        return { ok: false, message: copy.WSH_23.notFound, code: "WISH_ITEM_NOT_FOUND" };
      }
      return { ok: false, message: copy.WSH_22.saveError, code: result.error.code };
    }
    return { ok: true, output: result.value };
  } catch {
    return { ok: false, message: copy.GLB_08 };
  }
}

export async function removeWishItemAction(
  accessToken: string,
  itemId: string
): Promise<RemoveWishItemActionResult> {
  try {
    const deps = await getDeps();
    const result = await removeWishItem({ accessToken, itemId }, deps);
    if (!result.ok) {
      return { ok: false, message: copy.WSH_22.saveError, code: result.error.code };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: copy.GLB_08 };
  }
}

export async function listWishItemsAction(accessToken: string): Promise<ListWishItemsActionResult> {
  try {
    const deps = await getDeps();
    const result = await listWishItems({ accessToken }, deps);
    if (!result.ok) {
      return { ok: false, message: copy.WSH_22.loadError, code: result.error.code };
    }
    return { ok: true, items: result.value };
  } catch {
    return { ok: false, message: copy.GLB_08 };
  }
}
