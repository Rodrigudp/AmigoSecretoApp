import { afterEach, describe, expect, it, vi } from "vitest";
import { secureRandomInt } from "@/src/infrastructure/random";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("secureRandomInt", () => {
  it("discards samples in the biased tail before taking the remainder", () => {
    const getRandomValues = vi
      .fn<(sample: Uint32Array) => Uint32Array>()
      .mockImplementationOnce((sample) => {
        sample[0] = 2 ** 32 - 6;
        return sample;
      })
      .mockImplementationOnce((sample) => {
        sample[0] = 2 ** 32 - 7;
        return sample;
      });
    vi.stubGlobal("crypto", { getRandomValues });

    expect(secureRandomInt(10)).toBe(9);
    expect(getRandomValues).toHaveBeenCalledTimes(2);
  });

  it("accepts the full range of unsigned 32-bit samples when the bound divides it", () => {
    const getRandomValues = vi.fn((sample: Uint32Array) => {
      sample[0] = 2 ** 32 - 1;
      return sample;
    });
    vi.stubGlobal("crypto", { getRandomValues });

    expect(secureRandomInt(2 ** 32)).toBe(2 ** 32 - 1);
    expect(getRandomValues).toHaveBeenCalledTimes(1);
  });

  it.each([0, 1.5, 2 ** 32 + 1, Number.NaN])("rejects an invalid bound (%s)", (bound) => {
    expect(() => secureRandomInt(bound)).toThrow(RangeError);
  });
});
