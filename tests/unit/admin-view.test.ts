// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getAdminView } from "../../src/application/get-admin-view";
import type { AdminGroup, AdminScope, GroupRepository, TokenService } from "../../src/application/ports";
import { err, ok } from "../../src/shared/result";

const APP_URL = "https://amigo-secreto-app.vercel.app";

const sampleAdminGroup: AdminGroup = {
  group: { name: "Família Silva", maxValueCents: 5000, exchangeDate: "2026-12-25", location: "Casa da Vó" },
  inviteUrl: "/g/invite-token-123",
  draw: { status: "open" },
  participantCount: 0,
  participants: [],
};

type FakeConfig = {
  adminScope?: AdminScope | null;
  adminGroup?: AdminGroup;
  repoError?: { code: "INVALID_LINK" };
};

function makeDeps(config: FakeConfig = {}) {
  const groups: GroupRepository = {
    createOrRotateAdminToken: async () => { throw new Error("not used"); },
    findByInvite: async () => null,
    findAdminByHash: async (hash: string) => {
      if (config.adminScope !== undefined) return config.adminScope;
      return hash === "hash(valid-admin-token)" ? { groupId: "grp-1", adminTokenHash: hash } : null;
    },
    getAdminView: async () => config.repoError ? err(config.repoError) : ok(config.adminGroup ?? sampleAdminGroup),
    removeParticipant: async () => { throw new Error("not used"); },
  };
  const tokens: TokenService = {
    generate: () => "generated-token",
    hash: (token) => `hash(${token})`,
  };
  return { groups, tokens, appUrl: APP_URL };
}

describe("get-admin-view (RF06, GRP-05)", () => {
  it("returns admin view with empty participant list and mounts inviteUrl", async () => {
    const deps = makeDeps({ adminGroup: { ...sampleAdminGroup, participantCount: 0, participants: [] } });
    const result = await getAdminView({ adminToken: "valid-admin-token" }, deps);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.group.name).toBe("Família Silva");
    expect(result.value.participantCount).toBe(0);
    expect(result.value.participants).toEqual([]);
    expect(result.value.inviteUrl).toBe(`${APP_URL}/g/invite-token-123`);
    expect(result.value.draw).toEqual({ status: "open" });
  });

  it("returns admin view with active participants", async () => {
    const deps = makeDeps({
      adminGroup: {
        ...sampleAdminGroup,
        participantCount: 2,
        participants: [
          { id: "p-1", displayName: "Maria", joinedAt: "2026-11-17T12:00:00Z" },
          { id: "p-2", displayName: "João", joinedAt: "2026-11-17T12:05:00Z" },
        ],
      },
    });
    const result = await getAdminView({ adminToken: "valid-admin-token" }, deps);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.participantCount).toBe(2);
    expect(result.value.participants).toHaveLength(2);
  });

  it("preserves absolute inviteUrl if already provided by repository", async () => {
    const deps = makeDeps({ adminGroup: { ...sampleAdminGroup, inviteUrl: "https://custom.domain/g/token-xyz" } });
    const result = await getAdminView({ adminToken: "valid-admin-token" }, deps);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.inviteUrl).toBe("https://custom.domain/g/token-xyz");
  });

  it("returns INVALID_LINK for unknown or invalid admin token (ADR-002)", async () => {
    const deps = makeDeps({ adminScope: null });
    expect(await getAdminView({ adminToken: "unknown-token" }, deps)).toEqual(err({ code: "INVALID_LINK" }));
  });

  it("returns INVALID_INPUT when adminToken is empty or invalid", async () => {
    const deps = makeDeps();
    expect(await getAdminView({ adminToken: "   " }, deps)).toEqual(err({ code: "INVALID_INPUT" }));
    expect(await getAdminView({}, deps)).toEqual(err({ code: "INVALID_INPUT" }));
  });

  it("returns repository error when getAdminView fails", async () => {
    const deps = makeDeps({ repoError: { code: "INVALID_LINK" } });
    expect(await getAdminView({ adminToken: "valid-admin-token" }, deps)).toEqual(err({ code: "INVALID_LINK" }));
  });
});
