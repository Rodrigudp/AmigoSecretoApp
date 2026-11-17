import { test, expect } from "@playwright/test";

test.describe("Smoke E2E", () => {
  test("sanity check for test infrastructure", async () => {
    expect(true).toBe(true);
  });
});
