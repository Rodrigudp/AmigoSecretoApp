// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { accessTokensEqual } from "@/app/_lib/access-token";
import {
  clearStubJoins,
  resolvePersonalAccessUseCase,
  seedStubPersonalAccess,
} from "@/app/_lib/participant-stubs";

afterEach(() => clearStubJoins());

describe("participant personal-area stubs (PAR-04 still stubbed)", () => {
  it("resolvePersonalAccess reads the in-memory stub store", async () => {
    seedStubPersonalAccess("tok-1", {
      groupId: "group-1",
      displayName: "Ana",
      expiresAt: "2099-01-01T00:00:00.000Z",
      group: {
        name: "Família",
        maxValueCents: 5000,
        exchangeDate: "2099-12-24",
        location: null,
        status: "open",
      },
    });

    const resolved = await resolvePersonalAccessUseCase("tok-1");
    expect(resolved).toEqual({
      ok: true,
      value: {
        groupId: "group-1",
        displayName: "Ana",
        expiresAt: "2099-01-01T00:00:00.000Z",
        group: {
          name: "Família",
          maxValueCents: 5000,
          exchangeDate: "2099-12-24",
          location: null,
          status: "open",
        },
      },
    });
    expect(await resolvePersonalAccessUseCase("missing")).toEqual({
      ok: false,
      error: { code: "INVALID_LINK" },
    });
  });

  it("accessTokensEqual is true only for the same token", () => {
    expect(accessTokensEqual("abc", "abc")).toBe(true);
    expect(accessTokensEqual("abc", "abd")).toBe(false);
  });
});
