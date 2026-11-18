import { api } from "./api";
import { ApiError } from "./client";
import { cachedWishes, queueWish, syncWishes, visibleWishes } from "./wish-cache";

jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: async (_: string, value: string) => `hash-${value}`,
}));
jest.mock("./api", () => ({
  useDemo: true,
  api: jest.requireActual<typeof import("./mock")>("./mock").createMockApi(),
}));

it("retains offline edits and reconciles an add whose response was lost", async () => {
  const credential = "demo-participant";
  const original = await syncWishes(credential);
  const draft = { title: "Caneca", url: "https://example.com/caneca", note: null };
  const ids = original.items.map(({ id }) => id);

  let cache = await queueWish(credential, original, { kind: "add", id: "local-1", draft, existingIds: ids });
  cache = await queueWish(credential, cache, { kind: "add", id: "local-2", draft, existingIds: ids });
  expect(visibleWishes(cache).filter(({ title }) => title === draft.title)).toHaveLength(2);
  expect(await cachedWishes("demo-bruno")).toBeNull();

  const addWish = api.addWish;
  const add = jest.spyOn(api, "addWish").mockImplementationOnce(async (token, body) => {
    await addWish(token, body);
    throw new ApiError("OFFLINE", "Sem conexão no momento.");
  });
  await expect(syncWishes(credential)).rejects.toMatchObject({ code: "OFFLINE" });
  expect((await cachedWishes(credential))?.pending).toHaveLength(2);

  const synced = await syncWishes(credential);
  expect(synced.pending).toEqual([]);
  expect(synced.items.filter(({ title }) => title === draft.title)).toHaveLength(2);
  add.mockRestore();
});
