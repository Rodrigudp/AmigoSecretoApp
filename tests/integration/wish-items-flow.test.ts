// @vitest-environment node
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { useIntegrationDatabase } from "./harness";
import { createGroupUseCase } from "../../app/_lib/create-group-usecase";
import { joinGroupUseCase } from "../../app/_lib/participant-stubs";

const DAY_MS = 86_400_000;
const blank = { url: null, note: null, affiliateUrl: null, store: null } as const;
const hashToken = (token: string) => createHash("sha256").update(token, "utf8").digest("hex");

describe("wish_items adapter (LST-02)", () => {
  const harness = useIntegrationDatabase();

  async function seedParticipant(requestId: string, name: string) {
    const exchangeDate = new Date(Date.now() + 10 * DAY_MS).toISOString().slice(0, 10);
    const created = await createGroupUseCase({
      name,
      maxValueCents: 5000,
      exchangeDate,
      location: null,
      requestId,
    });
    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("create failed");
    const inviteToken = created.value.inviteUrl.split("/g/")[1]!;
    const joined = await joinGroupUseCase({ inviteToken, displayName: "Ana" });
    expect(joined.ok).toBe(true);
    if (!joined.ok) throw new Error("join failed");
    const participantId = (
      await harness.db
        .from("participants")
        .select("id")
        .eq("group_id", joined.value.groupId)
        .single()
    ).data!.id;
    return {
      participantId,
      groupId: joined.value.groupId,
      access: {
        participantId,
        accessTokenHash: hashToken(joined.value.accessToken),
      },
    };
  }

  it("lists, adds, updates, deletes and enforces the 20-item cap", async () => {
    expect(harness.available).toBe(true);
    const { createWishItemRepository, countWishItemsForParticipant } =
      await import("../../src/infrastructure/supabase/wish-item-repository");
    const { access, participantId, groupId } = await seedParticipant(
      "c2a0d8e4-6e5b-4c3d-9d4f-9f8e7c6b5d4a",
      "Lista BE LST-02"
    );
    const wishes = createWishItemRepository(harness.db);

    expect(await wishes.listOwn(access)).toMatchObject({ ok: true, value: [] });

    const added = await wishes.addOwn(access, {
      title: "Fone",
      url: "https://www.amazon.com.br/dp/B0A",
      note: "preto",
      affiliateUrl: "https://www.amazon.com.br/dp/B0A?tag=papelzinho-20",
      store: "amazon",
    });
    expect(added.ok).toBe(true);
    if (!added.ok) return;
    expect(added.value.productLink?.store).toBe("amazon");

    const updated = await wishes.updateOwn(access, added.value.id, {
      title: "Fone Pro",
      ...blank,
      url: "https://www.amazon.com.br/dp/B0B",
    });
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.value.title).toBe("Fone Pro");
    expect(await wishes.getVisibleLink(access, added.value.id)).toMatchObject({
      ok: true,
      value: { groupId, url: "https://www.amazon.com.br/dp/B0B" },
    });

    for (let i = 0; i < 19; i += 1) {
      expect((await wishes.addOwn(access, { title: `Item ${i + 2}`, ...blank })).ok).toBe(true);
    }
    expect(await countWishItemsForParticipant(harness.db, participantId)).toBe(20);
    expect(await wishes.addOwn(access, { title: "Item 21", ...blank })).toEqual({
      ok: false,
      error: { code: "WISH_LIST_FULL" },
    });

    expect(await wishes.deleteOwn(access, added.value.id)).toEqual({
      ok: true,
      value: { id: added.value.id },
    });
    expect(await countWishItemsForParticipant(harness.db, participantId)).toBe(19);
    expect(await wishes.deleteOwn(access, added.value.id)).toEqual({
      ok: false,
      error: { code: "WISH_ITEM_NOT_FOUND" },
    });
  });

  it("allows only one of two concurrent inserts when 19 items already exist", async () => {
    expect(harness.available).toBe(true);
    const { createWishItemRepository, countWishItemsForParticipant } =
      await import("../../src/infrastructure/supabase/wish-item-repository");
    const { access, participantId } = await seedParticipant(
      "d3b1e9f5-7f6c-4d4e-ae5a-0a9f8d7c6e5b",
      "Lista BE LST-02 race"
    );
    const wishes = createWishItemRepository(harness.db);

    for (let i = 0; i < 19; i += 1) {
      expect((await wishes.addOwn(access, { title: `Seed ${i + 1}`, ...blank })).ok).toBe(true);
    }
    expect(await countWishItemsForParticipant(harness.db, participantId)).toBe(19);

    const [first, second] = await Promise.all([
      wishes.addOwn(access, { title: "Race A", ...blank }),
      wishes.addOwn(access, { title: "Race B", ...blank }),
    ]);
    const successes = [first, second].filter((r) => r.ok);
    const failures = [first, second].filter((r) => !r.ok);
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toEqual({ ok: false, error: { code: "WISH_LIST_FULL" } });
    expect(await countWishItemsForParticipant(harness.db, participantId)).toBe(20);
  });
});
