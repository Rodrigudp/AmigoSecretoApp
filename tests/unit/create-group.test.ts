// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  createGroup,
  calculateGroupExpiresAt,
  getTodayInSaoPaulo,
  type CreateGroupDeps,
} from "../../src/application/create-group";
import type {
  Clock,
  GroupRepository,
  NewGroup,
  TokenService,
} from "../../src/application/ports";
import { err, ok } from "../../src/shared/result";

const APP_URL = "https://amigo-secreto-app-five.vercel.app";
const VALID_REQUEST_ID = "c9bf9e57-1685-4c89-bafb-ff5af830be8a";

type FakeConfig = {
  createResult?: (input: NewGroup) => ReturnType<GroupRepository["createOrRotateAdminToken"]>;
  clockDate?: Date;
};

function makeDeps(config: FakeConfig = {}) {
  const createdInputs: NewGroup[] = [];

  const groups = {
    createOrRotateAdminToken: async (input: NewGroup) => {
      createdInputs.push(input);
      return config.createResult
        ? config.createResult(input)
        : ok({ groupId: "group-uuid-1", inviteToken: input.inviteToken });
    },
  } as unknown as GroupRepository;

  let tokenCounter = 0;
  const tokens: TokenService = {
    generate: () => `token-${++tokenCounter}`,
    hash: (token: string) => `sha256(${token})`,
  };

  const clock: Clock = {
    now: () => config.clockDate ?? new Date("2026-11-17T15:00:00Z"),
  };

  return {
    deps: { groups, tokens, clock, appUrl: APP_URL } as CreateGroupDeps,
    createdInputs,
  };
}

describe("create-group use case (RF01, RF02, GRP-02)", () => {
  const validPayload = {
    name: "Família Silva",
    maxValueCents: 5000,
    exchangeDate: "2026-12-25",
    location: "Casa da Vó Maria",
    requestId: VALID_REQUEST_ID,
  };

  it("creates a group successfully and returns mounted invite and admin URLs", async () => {
    const { deps, createdInputs } = makeDeps();
    const result = await createGroup(validPayload, deps);

    expect(result).toEqual(
      ok({
        inviteUrl: `${APP_URL}/g/token-1`,
        adminUrl: `${APP_URL}/admin/token-2`,
      })
    );
    expect(createdInputs[0]).toEqual({
      name: "Família Silva",
      maxValueCents: 5000,
      exchangeDate: "2026-12-25",
      location: "Casa da Vó Maria",
      inviteToken: "token-1",
      adminTokenHash: "sha256(token-2)",
      requestId: VALID_REQUEST_ID,
      expiresAt: calculateGroupExpiresAt("2026-12-25"),
    });
  });

  it("normalizes empty or undefined location to null", async () => {
    const { deps, createdInputs } = makeDeps();

    await createGroup({ ...validPayload, location: "   " }, deps);
    expect(createdInputs[0]?.location).toBeNull();

    await createGroup({ ...validPayload, location: undefined }, deps);
    expect(createdInputs[1]?.location).toBeNull();
  });

  it("strips trailing slash from appUrl when mounting URLs", async () => {
    const { deps } = makeDeps();
    deps.appUrl = "https://amigo-secreto-app-five.vercel.app/";

    const result = await createGroup(validPayload, deps);
    expect(result).toEqual(
      ok({
        inviteUrl: "https://amigo-secreto-app-five.vercel.app/g/token-1",
        adminUrl: "https://amigo-secreto-app-five.vercel.app/admin/token-2",
      })
    );
  });

  describe("validation rules", () => {
    it("rejects invalid group names with INVALID_INPUT", async () => {
      const { deps } = makeDeps();
      expect(await createGroup({ ...validPayload, name: "   " }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect(await createGroup({ ...validPayload, name: "A".repeat(61) }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect(await createGroup({ ...validPayload, name: "<script>alert(1)</script>" }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
    });

    it("rejects non-positive or non-integer maxValueCents with INVALID_INPUT", async () => {
      const { deps } = makeDeps();
      expect(await createGroup({ ...validPayload, maxValueCents: 0 }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect(await createGroup({ ...validPayload, maxValueCents: -100 }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect(await createGroup({ ...validPayload, maxValueCents: 50.5 }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
    });

    it("rejects invalid calendar dates with INVALID_INPUT", async () => {
      const { deps } = makeDeps();
      expect(await createGroup({ ...validPayload, exchangeDate: "25/12/2026" }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect(await createGroup({ ...validPayload, exchangeDate: "2026-02-29" }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect(await createGroup({ ...validPayload, exchangeDate: "2026-13-01" }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
    });

    it("rejects exchangeDate in the past or on today in America/Sao_Paulo with INVALID_INPUT", async () => {
      const { deps } = makeDeps({ clockDate: new Date("2026-11-17T15:00:00Z") });
      expect(await createGroup({ ...validPayload, exchangeDate: "2026-11-16" }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect(await createGroup({ ...validPayload, exchangeDate: "2026-11-17" }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect((await createGroup({ ...validPayload, exchangeDate: "2026-11-18" }, deps)).ok).toBe(true);
    });

    it("respects America/Sao_Paulo timezone boundaries across UTC midnight", async () => {
      // 2026-11-18T01:30:00Z is 2026-11-17T22:30:00-03:00 (still 17/11 in Sao Paulo)
      const { deps } = makeDeps({ clockDate: new Date("2026-11-18T01:30:00Z") });
      expect(getTodayInSaoPaulo(deps.clock.now())).toBe("2026-11-17");

      expect(await createGroup({ ...validPayload, exchangeDate: "2026-11-17" }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect((await createGroup({ ...validPayload, exchangeDate: "2026-11-18" }, deps)).ok).toBe(true);
    });

    it("rejects location longer than 120 characters with INVALID_INPUT", async () => {
      const { deps } = makeDeps();
      expect(await createGroup({ ...validPayload, location: "L".repeat(121) }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
    });

    it("rejects non-UUID-v4 requestId with INVALID_INPUT", async () => {
      const { deps } = makeDeps();
      expect(await createGroup({ ...validPayload, requestId: "not-a-uuid" }, deps)).toEqual(
        err({ code: "INVALID_INPUT" })
      );
      expect(
        await createGroup({ ...validPayload, requestId: "c9bf9e57-1685-1c89-bafb-ff5af830be8a" }, deps)
      ).toEqual(err({ code: "INVALID_INPUT" }));
    });
  });

  describe("idempotency and repository delegation", () => {
    it("delegates idempotent replay to repository and returns same group with newly rotated admin token", async () => {
      const existingInviteToken = "original-invite-token-xyz";
      const { deps } = makeDeps({
        createResult: async (input) => {
          expect(input.requestId).toBe(VALID_REQUEST_ID);
          return ok({ groupId: "existing-group-id", inviteToken: existingInviteToken });
        },
      });

      const result = await createGroup(validPayload, deps);
      expect(result).toEqual(
        ok({
          inviteUrl: `${APP_URL}/g/${existingInviteToken}`,
          adminUrl: `${APP_URL}/admin/token-2`,
        })
      );
    });

    it("propagates IDEMPOTENCY_CONFLICT when repository rejects conflicting re-submission", async () => {
      const { deps } = makeDeps({
        createResult: async () => err({ code: "IDEMPOTENCY_CONFLICT" }),
      });

      expect(await createGroup(validPayload, deps)).toEqual(err({ code: "IDEMPOTENCY_CONFLICT" }));
    });
  });
});
