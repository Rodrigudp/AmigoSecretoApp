import { describe, expect, expectTypeOf, it } from "vitest";
import { err, ok, type Result } from "../../src/shared/result";

function getResult(success: boolean): Result<number, { code: string }> {
  return success ? ok(0) : err({ code: "INVALID_INPUT" });
}

describe("Result", () => {
  it("preserves a falsy success value and narrows by ok", () => {
    const result = getResult(true);

    if (!result.ok) throw new Error("Expected a success");

    expectTypeOf(result.value).toEqualTypeOf<number>();
    expect(result).toEqual({ ok: true, value: 0 });
  });

  it("preserves a typed error and narrows by ok", () => {
    const result = getResult(false);

    if (result.ok) throw new Error("Expected an error");

    expectTypeOf(result.error).toEqualTypeOf<{ code: string }>();
    expect(result).toEqual({ ok: false, error: { code: "INVALID_INPUT" } });
  });
});
