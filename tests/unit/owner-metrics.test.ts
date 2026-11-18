import { describe, expect, it } from "vitest";
import { authorized, metrics } from "../../app/owner/metrics";

describe("owner metrics", () => {
  it("requires a configured strong secret and valid Basic credentials", () => {
    const secret = "x".repeat(32);
    const auth = (password: string) =>
      `Basic ${Buffer.from(`owner:${password}`).toString("base64")}`;
    expect(authorized(auth(secret), secret)).toBe(true);
    expect(authorized(auth("wrong"), secret)).toBe(false);
    expect(authorized(auth(""), undefined)).toBe(false);
    expect(authorized(auth("weak"), "weak")).toBe(false);
  });
  it("calculates global ratios and handles missing denominators", () => {
    expect(metrics(2, 10, 5)).toEqual({ joins: 10, perGroup: "5", perJoin: "0,5" });
    expect(metrics(0, 0, 0)).toEqual({
      joins: 0,
      perGroup: "Indisponível",
      perJoin: "Indisponível",
    });
  });
});
