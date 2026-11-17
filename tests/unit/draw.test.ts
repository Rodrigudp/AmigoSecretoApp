import { describe, expect, it, vi } from "vitest";
import { drawPairs } from "@/src/domain/draw";

describe("drawPairs", () => {
  it.each([[], ["a"], ["a", "b"]].map((ids) => ({ ids })))(
    "rejects fewer than three participants: $ids",
    ({ ids }) => {
      const rng = vi.fn(() => 0);

      expect(drawPairs(ids, rng)).toEqual({
        ok: false,
        error: { code: "NOT_ENOUGH_PARTICIPANTS" },
      });
      expect(rng).not.toHaveBeenCalled();
    }
  );

  it("rejects duplicate participant IDs before shuffling", () => {
    const rng = vi.fn(() => 0);

    expect(drawPairs(["a", "b", "a"], rng)).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT" },
    });
    expect(rng).not.toHaveBeenCalled();
  });

  it("builds one cycle for three participants without mutating the input", () => {
    const ids = Object.freeze(["a", "b", "c"]);
    const rng = vi.fn(() => 0);

    expect(drawPairs(ids, rng)).toEqual({
      ok: true,
      value: [
        { giverId: "b", receiverId: "c" },
        { giverId: "c", receiverId: "a" },
        { giverId: "a", receiverId: "b" },
      ],
    });
    expect(rng.mock.calls).toEqual([[3], [2]]);
    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("still builds a cycle when each shuffle step keeps the current position", () => {
    expect(drawPairs(["a", "b", "c", "d"], (maxExclusive) => maxExclusive - 1)).toEqual({
      ok: true,
      value: [
        { giverId: "a", receiverId: "b" },
        { giverId: "b", receiverId: "c" },
        { giverId: "c", receiverId: "d" },
        { giverId: "d", receiverId: "a" },
      ],
    });
  });
});
