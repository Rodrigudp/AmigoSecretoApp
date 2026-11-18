// @vitest-environment node
import { describe, expect, it } from "vitest";
import { accessTokensEqual } from "@/app/_lib/access-token";

describe("participant access helpers (PAR-04 / ADR-004)", () => {
  it("accessTokensEqual is true only for the same token", () => {
    expect(accessTokensEqual("abc", "abc")).toBe(true);
    expect(accessTokensEqual("abc", "abd")).toBe(false);
  });
});
