// @vitest-environment node
import { describe, expect, it } from "vitest";

import { removeParticipant } from "../../src/application/remove-participant";
import type { AdminScope, GroupRepository, TokenService } from "../../src/application/ports";
import type { DomainError } from "../../src/domain/errors";
import { err, ok } from "../../src/shared/result";

type FakeConfig = {
  adminScope?: AdminScope | null;
  removeResult?: { ok: true; value: { participantCount: number } } | { ok: false; error: DomainError };
};

function makeDeps(config: FakeConfig = {}) {
  let recordedAdmin: AdminScope | null = null;
  let recordedParticipantId: string | null = null;

  const groups: GroupRepository = {
    createOrRotateAdminToken: async () => { throw new Error("not used"); },
    findByInvite: async () => null,
    findAdminByHash: async (hash: string) => {
      if (config.adminScope !== undefined) return config.adminScope;
      return hash === "hash(valid-admin-token)" ? { groupId: "grp-1", adminTokenHash: hash } : null;
    },
    getAdminView: async () => { throw new Error("not used"); },
    removeParticipant: async (admin, participantId) => {
      recordedAdmin = admin;
      recordedParticipantId = participantId;
      return config.removeResult ?? ok({ participantCount: 2 });
    },
  };

  const tokens: TokenService = {
    generate: () => "generated-token",
    hash: (token) => `hash(${token})`,
  };

  return { deps: { groups, tokens }, getCalls: () => ({ recordedAdmin, recordedParticipantId }) };
}

describe("remove-participant (RF07, RN04, RN06, GRP-05)", () => {
  it("removes an active participant and returns the updated participant count", async () => {
    const { deps, getCalls } = makeDeps({ removeResult: ok({ participantCount: 3 }) });
    const result = await removeParticipant({ adminToken: "valid-admin-token", participantId: "p-456" }, deps);
    expect(result).toEqual(ok({ participantCount: 3 }));
    expect(getCalls().recordedAdmin).toEqual({ groupId: "grp-1", adminTokenHash: "hash(valid-admin-token)" });
    expect(getCalls().recordedParticipantId).toBe("p-456");
  });

  it("rejects removal after draw with GROUP_CLOSED (RN04)", async () => {
    const { deps } = makeDeps({ removeResult: err({ code: "GROUP_CLOSED" }) });
    const result = await removeParticipant({ adminToken: "valid-admin-token", participantId: "p-456" }, deps);
    expect(result).toEqual(err({ code: "GROUP_CLOSED" }));
  });

  it("returns PARTICIPANT_NOT_FOUND when participant does not exist or was already removed", async () => {
    const { deps } = makeDeps({ removeResult: err({ code: "PARTICIPANT_NOT_FOUND" }) });
    const result = await removeParticipant({ adminToken: "valid-admin-token", participantId: "p-missing" }, deps);
    expect(result).toEqual(err({ code: "PARTICIPANT_NOT_FOUND" }));
  });

  it("returns INVALID_LINK when admin token is unknown or invalid (ADR-002)", async () => {
    const { deps } = makeDeps({ adminScope: null });
    const result = await removeParticipant({ adminToken: "invalid-token", participantId: "p-456" }, deps);
    expect(result).toEqual(err({ code: "INVALID_LINK" }));
  });

  it("returns INVALID_INPUT when adminToken, participantId or payload is invalid", async () => {
    const { deps } = makeDeps();
    expect(await removeParticipant({ adminToken: "   ", participantId: "p-456" }, deps)).toEqual(err({ code: "INVALID_INPUT" }));
    expect(await removeParticipant({ adminToken: "valid-admin-token", participantId: "   " }, deps)).toEqual(err({ code: "INVALID_INPUT" }));
    expect(await removeParticipant({ adminToken: "valid-admin-token" }, deps)).toEqual(err({ code: "INVALID_INPUT" }));
  });
});
