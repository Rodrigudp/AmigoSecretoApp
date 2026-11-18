"use server";

import { cookies } from "next/headers";
import { copy } from "./_lib/copy";
import { cookieNameFor } from "./_lib/participant-view-usecase";
import { addWishItemAction, removeWishItemAction, updateWishItemAction } from "./wish-actions";

async function readCookieToken(groupId: string) {
  const cookieStore = await cookies();
  return cookieStore.get(cookieNameFor(groupId))?.value;
}

export async function addWishItemCookieAction(
  groupId: string,
  fields: Parameters<typeof addWishItemAction>[1]
): ReturnType<typeof addWishItemAction> {
  const accessToken = await readCookieToken(groupId);
  if (!accessToken) return { ok: false, message: copy.GLB_08, code: "NO_COOKIE" };
  return addWishItemAction(accessToken, fields);
}

export async function updateWishItemCookieAction(
  groupId: string,
  itemId: string,
  fields: Parameters<typeof updateWishItemAction>[2]
): ReturnType<typeof updateWishItemAction> {
  const accessToken = await readCookieToken(groupId);
  if (!accessToken) return { ok: false, message: copy.GLB_08, code: "NO_COOKIE" };
  return updateWishItemAction(accessToken, itemId, fields);
}

export async function removeWishItemCookieAction(
  groupId: string,
  itemId: string
): ReturnType<typeof removeWishItemAction> {
  const accessToken = await readCookieToken(groupId);
  if (!accessToken) return { ok: false, message: copy.GLB_08, code: "NO_COOKIE" };
  return removeWishItemAction(accessToken, itemId);
}
