import { describe, expect, it, vi } from "vitest";
import { drawPairs, type Pair } from "@/src/domain/draw";
import { secureRandomInt } from "@/src/infrastructure/random";

vi.mock("server-only", () => ({}));

function seededRandom(seed: number): (maxExclusive: number) => number {
  let state = seed >>> 0;
  return (maxExclusive) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return Math.floor((state / 2 ** 32) * maxExclusive);
  };
}

function assertSingleCycle(ids: string[], pairs: Pair[], context: string): void {
  const fail = (reason: string): never => {
    throw new Error(`${context}: ${reason}`);
  };
  const expected = new Set(ids);
  const givers = new Set(pairs.map((pair) => pair.giverId));
  const receivers = new Set(pairs.map((pair) => pair.receiverId));
  if (pairs.length !== ids.length || givers.size !== ids.length || receivers.size !== ids.length) {
    fail("each participant must give and receive exactly once");
  }
  if (
    pairs.some(({ giverId, receiverId }) => !expected.has(giverId) || !expected.has(receiverId))
  ) {
    fail("all givers and receivers must be participants");
  }
  if (pairs.some(({ giverId, receiverId }) => giverId === receiverId)) {
    fail("a participant drew themselves");
  }
  assertCycleConnectivity(ids, pairs, context);
}

function assertCycleConnectivity(ids: string[], pairs: Pair[], context: string): void {
  const fail = (reason: string): never => {
    throw new Error(context + ": " + reason);
  };
  const next = new Map(pairs.map(({ giverId, receiverId }) => [giverId, receiverId]));
  const visited = new Set<string>();
  let current = ids[0];
  while (!visited.has(current) && visited.size < ids.length) {
    visited.add(current);
    current = next.get(current) ?? fail("cycle ends prematurely");
  }
  if (current !== ids[0] || visited.size !== ids.length) fail("draw is not one cycle");
}

function checkDraw(n: number, rng: (maxExclusive: number) => number, context: string): void {
  const ids = Array.from({ length: n }, (_, i) => `participant-${i}`);
  const result = drawPairs(ids, rng);
  if (!result.ok) throw new Error(`${context}: unexpected ${result.error.code}`);
  assertSingleCycle(ids, result.value, context);
}

describe("drawPairs properties", () => {
  it("forms one permutation without fixed points in 10000 seeded draws across sizes 3 to 100", () => {
    for (let run = 0; run < 10_000; run++) {
      const n = 3 + (run % 98);
      const seed = (0x9e3779b9 + run) >>> 0;
      checkDraw(n, seededRandom(seed), `seed=${seed} n=${n} run=${run}`);
    }
  });

  it.each([3, 4, 10, 50, 100])(
    "forms one cycle with the production RNG for %i participants",
    (n) => {
      checkDraw(n, secureRandomInt, `production RNG n=${n}`);
    }
  );

  it.each([0, 1, 2])("rejects %i participants", (n) => {
    const ids = Array.from({ length: n }, (_, i) => `participant-${i}`);
    expect(drawPairs(ids, seededRandom(1))).toEqual({
      ok: false,
      error: { code: "NOT_ENOUGH_PARTICIPANTS" },
    });
  });
});
