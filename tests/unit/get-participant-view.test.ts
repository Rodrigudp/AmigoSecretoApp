import { describe, expect, it } from "vitest";

import { getParticipantView } from "../../src/application/get-participant-view";
import type {
  GroupRepository,
  ParticipantRepository,
  TokenService,
  WishItemRepository,
} from "../../src/application/ports";
import { err, ok } from "../../src/shared/result";

const tokens: TokenService = {
  generate: () => "tok",
  hash: (token) => `hash(${token})`,
};

const openView = {
  displayName: "Ana",
  group: {
    name: "Família",
    maxValueCents: 5000,
    exchangeDate: "2026-12-20",
    location: null,
    status: "open" as const,
  },
  ownWishItems: [],
};

function makeRepo(overrides: {
  active?: Parameters<ParticipantRepository["getView"]>[0] | null;
  view?: ReturnType<ParticipantRepository["getView"]>;
  activeExtra?: Partial<{ groupId: string; displayName: string; expiresAt: string }>;
}): ParticipantRepository {
  const groups = undefined as unknown as GroupRepository;
  const wishItems = undefined as unknown as WishItemRepository;
  void groups;
  void wishItems;
  return {
    join: async () => {
      throw new Error("not used here");
    },
    findActiveByHash: async () =>
      overrides.active === null
        ? null
        : {
            participantId: "p-1",
            accessTokenHash: "hash(t1)",
            groupId: "g-1",
            displayName: "Ana",
            expiresAt: "2027-02-18",
            ...overrides.activeExtra,
          },
    getView: async () => overrides.view ?? ok(openView),
  };
}

const deps = (repo: ParticipantRepository) => ({ participants: repo, tokens });

describe("get-participant-view (RF04, PAR-04)", () => {
  it("resolves the participant view by hashing the personal token", async () => {
    const result = await getParticipantView({ accessToken: "t1" }, deps(makeRepo({})));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.view.displayName).toBe("Ana");
    expect(result.value.view.group.name).toBe("Família");
    expect(result.value.groupId).toBe("g-1");
    expect(result.value.expiresAt).toBe("2027-02-18");
  });

  it("returns INVALID_LINK for an unknown, expired or removed token (ADR-002)", async () => {
    const result = await getParticipantView(
      { accessToken: "gone" },
      deps(makeRepo({ active: null }))
    );

    expect(result).toEqual(err({ code: "INVALID_LINK" }));
  });

  it("returns INVALID_LINK for an empty token", async () => {
    const result = await getParticipantView({ accessToken: "   " }, deps(makeRepo({})));

    expect(result).toEqual(err({ code: "INVALID_LINK" }));
  });

  it("propagates repository errors from getView", async () => {
    const result = await getParticipantView(
      { accessToken: "t1" },
      deps(makeRepo({ view: Promise.resolve(err({ code: "INVALID_LINK" })) }))
    );

    expect(result).toEqual(err({ code: "INVALID_LINK" }));
  });

  it("passes a drawn group through so the area can show the result state (RN04)", async () => {
    const drawnView = {
      ...openView,
      group: { ...openView.group, status: "drawn" as const },
    };
    const result = await getParticipantView(
      { accessToken: "t1" },
      deps(makeRepo({ view: Promise.resolve(ok(drawnView)) }))
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.view.group.status).toBe("drawn");
  });
});
