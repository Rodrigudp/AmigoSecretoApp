import AsyncStorage from "@react-native-async-storage/async-storage";
import { CryptoDigestAlgorithm, digestStringAsync } from "expo-crypto";
import { api, useDemo } from "./api";
import { ApiError } from "./client";
import type { Wish, WishDraft } from "./contract";

type Change =
  | { kind: "add"; id: string; draft: WishDraft; existingIds: string[] }
  | { kind: "update"; id: string; draft: WishDraft }
  | { kind: "remove"; id: string };
export type WishCache = { items: Wish[]; pending: Change[] };

const preview = new Map<string, WishCache>();
const cacheKey = async (credential: string) =>
  `papelzinho.wishes.${await digestStringAsync(CryptoDigestAlgorithm.SHA256, credential)}`;

export async function readWishes(key: string): Promise<WishCache | null> {
  if (useDemo) return preview.get(key) ?? null;
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

async function writeWishes(key: string, cache: WishCache) {
  if (useDemo) preview.set(key, cache);
  else await AsyncStorage.setItem(key, JSON.stringify(cache));
}

export async function forgetWishes(credential: string) {
  const key = await cacheKey(credential);
  if (useDemo) preview.delete(key);
  else await AsyncStorage.removeItem(key);
}

export function visibleWishes({ items, pending }: WishCache): Wish[] {
  return pending.reduce((visible, change) => {
    if (change.kind === "remove") return visible.filter(({ id }) => id !== change.id);
    const updated = { ...change.draft, id: change.id };
    return change.kind === "add" ? [...visible, updated] : visible.map((item) => item.id === change.id ? updated : item);
  }, items);
}

export async function queueWish(credential: string, cache: WishCache, change: Change) {
  const key = await cacheKey(credential);
  const pending = [...cache.pending, change];
  const next = { ...cache, pending };
  await writeWishes(key, next);
  return next;
}

export async function cachedWishes(credential: string) {
  return readWishes(await cacheKey(credential));
}

export async function syncWishes(credential: string, initialItems?: Wish[]) {
  const key = await cacheKey(credential);
  const cached = await readWishes(key);
  let items = initialItems ?? (await api.wishes(credential)).items;
  const pending = [...(cached?.pending ?? [])];

  while (pending.length) {
    const change = pending[0];
    if (change.kind === "add") {
      const match = items.find((item) => !change.existingIds.includes(item.id) &&
        item.title === change.draft.title && item.note === change.draft.note && item.url === change.draft.url);
      const saved = match ?? (await api.addWish(credential, change.draft)).item;
      if (!match) items = [...items, saved];
      for (const [index, queued] of pending.entries()) {
        if (index > 0 && queued.kind === "add") {
          pending[index] = { ...queued, existingIds: [...queued.existingIds, saved.id] };
        }
      }
    } else if (change.kind === "update") {
      const { item } = await api.updateWish(credential, change.id, change.draft);
      items = items.map((prior) => prior.id === item.id ? item : prior);
    } else {
      try { await api.removeWish(credential, change.id); }
      catch (error) { if (!(error instanceof ApiError) || error.code !== "WISH_ITEM_NOT_FOUND") throw error; }
      items = items.filter((item) => item.id !== change.id);
    }
    pending.shift();
    await writeWishes(key, { items, pending });
  }
  const result = { items, pending };
  await writeWishes(key, result);
  return result;
}
