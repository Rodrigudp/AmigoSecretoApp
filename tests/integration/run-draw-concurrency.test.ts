// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { useIntegrationDatabase } from "./harness";

const DAY_MS = 86_400_000;
const ADMIN_HASH = "e".repeat(64);

describe("run_draw concurrency (SRT-02)", () => {
  const harness = useIntegrationDatabase();

  async function seedGroup(participants: number) {
    const db = harness.db;
    const { data: created, error } = await db.rpc("create_group_once", {
      p_request_id: crypto.randomUUID(),
      p_name: "Concorrência",
      p_max_value_cents: 5000,
      p_exchange_date: new Date(Date.now() + 10 * DAY_MS).toISOString().slice(0, 10),
      p_location: "Sala",
      p_invite_token: "invite-concurrency-token-0123456789",
      p_admin_token_hash: ADMIN_HASH,
      p_expires_at: new Date(Date.now() + 70 * DAY_MS).toISOString(),
    });
    expect(error).toBeNull();
    const groupId = created![0].group_id;
    for (let i = 1; i <= participants; i++) {
      const { error: joinError } = await db.rpc("join_group", {
        p_invite_token: "invite-concurrency-token-0123456789",
        p_display_name: `Pessoa ${i}`,
        p_access_token_hash: i.toString(16).padStart(64, "0"),
      });
      expect(joinError).toBeNull();
    }
    const { data: rows } = await db
      .from("participants")
      .select("id")
      .eq("group_id", groupId)
      .order("id");
    return { groupId, ids: rows!.map((r) => r.id) };
  }

  const shift = (ids: string[], by: number) => ids.map((_, i) => ids[(i + by) % ids.length]);

  it("two simultaneous identical calls create one draw, one event and one replay", async () => {
    const { groupId, ids } = await seedGroup(5);
    const args = {
      p_group_id: groupId,
      p_admin_token_hash: ADMIN_HASH,
      p_expected_version: 0,
      p_givers: ids,
      p_receivers: shift(ids, 1),
    };

    const results = await Promise.all([
      harness.db.rpc("run_draw", args),
      harness.db.rpc("run_draw", args),
      harness.db.rpc("run_draw", args),
    ]);

    for (const result of results) {
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].draw_version).toBe(1);
      expect(result.data![0].status).toBe("drawn");
    }
    expect(results.filter((r) => r.data![0].was_replay === false)).toHaveLength(1);
    expect(results.filter((r) => r.data![0].was_replay === true)).toHaveLength(2);
    expect(new Set(results.map((r) => r.data![0].drawn_at)).size).toBe(1);

    const draws = await harness.db.from("draws").select("id").eq("group_id", groupId);
    expect(draws.data).toHaveLength(1);
    const pairs = await harness.db.from("pairs").select("giver_id").eq("group_id", groupId);
    expect(pairs.data).toHaveLength(5);
    const events = await harness.db
      .from("events")
      .select("id")
      .eq("group_id", groupId)
      .eq("type", "draw_performed");
    expect(events.data).toHaveLength(1);
  });

  it("calls the push hook only for the committed draw", async () => {
    const { createDrawRepository } = await import("@/src/infrastructure/supabase/draw-repository");
    const { groupId, ids } = await seedGroup(5);
    const onFirstDraw = vi.fn();
    const draws = createDrawRepository(harness.db, onFirstDraw);
    const admin = { groupId, adminTokenHash: ADMIN_HASH };
    const pairs = ids.map((giverId, i) => ({ giverId, receiverId: ids[(i + 1) % ids.length] }));

    const receipts = await Promise.all([
      draws.commitFirstDraw(admin, ids, pairs),
      draws.commitFirstDraw(admin, ids, pairs),
    ]);
    expect(receipts.every((result) => result.ok)).toBe(true);
    expect(onFirstDraw).toHaveBeenCalledExactlyOnceWith(groupId);
  });

  it("a removal racing the draw never leaves a removed participant with a pair", async () => {
    const { groupId, ids } = await seedGroup(5);
    const [drawResult, removeResult] = await Promise.all([
      harness.db.rpc("run_draw", {
        p_group_id: groupId,
        p_admin_token_hash: ADMIN_HASH,
        p_expected_version: 0,
        p_givers: ids,
        p_receivers: shift(ids, 1),
      }),
      harness.db
        .from("participants")
        .update({ removed_at: new Date().toISOString() })
        .eq("id", ids[0]),
    ]);

    const drawn = drawResult.error === null;
    const removed = removeResult.error === null;
    // Exactly one wins: the draw (removal refused with GROUP_CLOSED) or the removal (draw sees 4 members).
    expect(drawn).not.toBe(removed);
    if (drawn) expect(removeResult.error?.message).toContain("GROUP_CLOSED");
    else expect(drawResult.error?.message).toContain("DRAW_MEMBERS_CHANGED");

    const { data: pairs } = await harness.db
      .from("pairs")
      .select("giver_id, receiver_id")
      .eq("group_id", groupId);
    const { data: active } = await harness.db
      .from("participants")
      .select("id")
      .eq("group_id", groupId)
      .is("removed_at", null);
    const activeIds = new Set(active!.map((p) => p.id));
    for (const pair of pairs!) {
      expect(activeIds.has(pair.giver_id)).toBe(true);
      expect(activeIds.has(pair.receiver_id)).toBe(true);
    }
  });
});
