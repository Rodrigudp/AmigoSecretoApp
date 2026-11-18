// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { runDraw, type RunDrawDeps } from "../../src/application/run-draw";
import { createDrawRepository } from "../../src/infrastructure/supabase/draw-repository";
import type { ServerSupabaseClient } from "../../src/infrastructure/supabase/client";
import { err, ok } from "../../src/shared/result";

function makeDeps(overrides: Partial<RunDrawDeps> = {}): RunDrawDeps {
  return {
    groups: {
      findAdminByHash: async (hash) =>
        hash === "hash(adm-ok)" ? { groupId: "grp-1", adminTokenHash: hash } : null,
    },
    draws: {
      readForFirstDraw: async () => ok({ status: "open", participantIds: ["p-1", "p-2", "p-3"] }),
      commitFirstDraw: async () => ok({ status: "drawn", drawnAt: "2026-11-18T12:00:00.000Z" }),
      getCurrentResult: async () => err({ code: "DRAW_NOT_READY" }),
    },
    tokens: {
      generate: () => "tok",
      hash: (token) => `hash(${token})`,
    },
    rng: () => 0,
    ...overrides,
  };
}

describe("run-draw use case (RF08, RN01-RN04, SRT-03)", () => {
  it("draws pairs and returns only DrawReceipt without leaking pairs", async () => {
    const commitSpy = vi.fn(async () =>
      ok({ status: "drawn" as const, drawnAt: "2026-11-18T12:00:00.000Z" })
    );
    const deps = makeDeps({
      draws: {
        readForFirstDraw: async () => ok({ status: "open", participantIds: ["p-1", "p-2", "p-3"] }),
        commitFirstDraw: commitSpy,
        getCurrentResult: async () => err({ code: "DRAW_NOT_READY" }),
      },
    });

    const result = await runDraw({ adminToken: "adm-ok", expectedParticipantCount: 3 }, deps);
    expect(result).toEqual(ok({ status: "drawn", drawnAt: "2026-11-18T12:00:00.000Z" }));
    expect(JSON.stringify(result)).not.toMatch(/p-1|p-2|p-3|giverId|receiverId/);
    expect(commitSpy).toHaveBeenCalledTimes(1);
  });

  it("returns persisted receipt idempotently when group is already drawn", async () => {
    const commitSpy = vi.fn();
    const deps = makeDeps({
      draws: {
        readForFirstDraw: async () => ok({ status: "drawn", drawnAt: "2026-11-18T10:00:00.000Z" }),
        commitFirstDraw: commitSpy,
        getCurrentResult: async () => err({ code: "DRAW_NOT_READY" }),
      },
    });

    const result = await runDraw({ adminToken: "adm-ok", expectedParticipantCount: 3 }, deps);
    expect(result).toEqual(ok({ status: "drawn", drawnAt: "2026-11-18T10:00:00.000Z" }));
    expect(commitSpy).not.toHaveBeenCalled();
  });

  it("rejects with NOT_ENOUGH_PARTICIPANTS when group has fewer than 3 active participants", async () => {
    const deps = makeDeps({
      draws: {
        readForFirstDraw: async () => ok({ status: "open", participantIds: ["p-1", "p-2"] }),
        commitFirstDraw: async () => err({ code: "NOT_ENOUGH_PARTICIPANTS" }),
        getCurrentResult: async () => err({ code: "DRAW_NOT_READY" }),
      },
    });

    expect(await runDraw({ adminToken: "adm-ok" }, deps)).toEqual(
      err({ code: "NOT_ENOUGH_PARTICIPANTS" })
    );
  });

  it("returns DRAW_MEMBERS_CHANGED when expectedParticipantCount differs or retries when omitted", async () => {
    let calls = 0;
    const deps = makeDeps({
      draws: {
        readForFirstDraw: async () =>
          ok({ status: "open", participantIds: ["p-1", "p-2", "p-3", "p-4"] }),
        commitFirstDraw: async () => {
          calls += 1;
          return calls === 1
            ? err({ code: "DRAW_MEMBERS_CHANGED" })
            : ok({ status: "drawn", drawnAt: "2026-11-18T12:05:00.000Z" });
        },
        getCurrentResult: async () => err({ code: "DRAW_NOT_READY" }),
      },
    });

    expect(await runDraw({ adminToken: "adm-ok", expectedParticipantCount: 3 }, deps)).toEqual(
      err({ code: "DRAW_MEMBERS_CHANGED" })
    );
    expect(await runDraw({ adminToken: "adm-ok" }, deps)).toEqual(
      ok({ status: "drawn", drawnAt: "2026-11-18T12:05:00.000Z" })
    );
    expect(calls).toBe(2);
  });

  it("validates input and admin token", async () => {
    const deps = makeDeps();
    expect(await runDraw({ adminToken: "   " }, deps)).toEqual(err({ code: "INVALID_INPUT" }));
    expect(await runDraw({ adminToken: "unknown" }, deps)).toEqual(err({ code: "INVALID_LINK" }));
  });

  it("commits first draw through Supabase RPC run_draw and validates giver set", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          draw_version: 1,
          status: "drawn",
          drawn_at: "2026-11-18T12:00:00.000Z",
          was_replay: false,
        },
      ],
      error: null,
    });
    const repo = createDrawRepository({ rpc } as unknown as ServerSupabaseClient);
    const admin = { groupId: "grp-1", adminTokenHash: "hash-1" };
    const ids = ["p-1", "p-2", "p-3"];
    const pairs = [
      { giverId: "p-1", receiverId: "p-2" },
      { giverId: "p-2", receiverId: "p-3" },
      { giverId: "p-3", receiverId: "p-1" },
    ];

    expect(await repo.commitFirstDraw(admin, ["p-1", "p-2"], pairs)).toEqual(
      err({ code: "INVALID_INPUT" })
    );
    expect(await repo.commitFirstDraw(admin, ids, pairs)).toEqual(
      ok({ status: "drawn", drawnAt: "2026-11-18T12:00:00.000Z" })
    );
    expect(rpc).toHaveBeenCalledWith("run_draw", {
      p_group_id: "grp-1",
      p_admin_token_hash: "hash-1",
      p_expected_version: 0,
      p_givers: ["p-1", "p-2", "p-3"],
      p_receivers: ["p-2", "p-3", "p-1"],
    });
  });

  it("invokes onDrawCompleted only on open -> drawn transition and ignores hook errors", async () => {
    const onDrawCompleted = vi.fn().mockRejectedValueOnce(new Error("push down"));
    const deps = makeDeps({ onDrawCompleted });

    expect(await runDraw({ adminToken: "adm-ok" }, deps)).toEqual(
      ok({ status: "drawn", drawnAt: "2026-11-18T12:00:00.000Z" })
    );
    expect(onDrawCompleted).toHaveBeenCalledTimes(1);
    expect(onDrawCompleted).toHaveBeenCalledWith({ groupId: "grp-1" });

    const replayDeps = makeDeps({
      onDrawCompleted,
      draws: {
        readForFirstDraw: async () =>
          ok({ status: "drawn", drawnAt: "2026-11-18T12:00:00.000Z" }),
        commitFirstDraw: async () => ok({ status: "drawn", drawnAt: "2026-11-18T12:00:00.000Z" }),
        getCurrentResult: async () => err({ code: "DRAW_NOT_READY" }),
      },
    });
    expect((await runDraw({ adminToken: "adm-ok" }, replayDeps)).ok).toBe(true);
    expect(onDrawCompleted).toHaveBeenCalledTimes(1);
  });
});
