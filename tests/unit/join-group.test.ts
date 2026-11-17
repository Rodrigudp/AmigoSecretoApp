// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { joinGroup } from "../../src/application/join-group";
import type {
  GroupRepository,
  ParticipantRepository,
  PublicGroup,
  TokenService,
} from "../../src/application/ports";
import type { EventRepository } from "../../src/application/ports";
import { err, ok } from "../../src/shared/result";

const APP_URL = "https://app.example.com";

const openGroup: PublicGroup = {
  name: "Família",
  maxValueCents: 5000,
  exchangeDate: "2026-12-20",
  location: null,
  status: "open",
};

type JoinInput = Parameters<ParticipantRepository["join"]>[0];

type FakeConfig = {
  invite?: { groupId: string; view: PublicGroup } | null;
  joinResult?: (input: JoinInput) => ReturnType<ParticipantRepository["join"]>;
  appendThrows?: boolean;
};

function makeDeps(config: FakeConfig = {}) {
  const joined: { current: JoinInput | null } = { current: null };
  const groups = {
    findByInvite: async () => config.invite ?? null,
  } as unknown as GroupRepository;
  const participants: ParticipantRepository = {
    join: async (input) => {
      joined.current = input;
      return config.joinResult
        ? config.joinResult(input)
        : ok({ displayName: input.displayName, groupId: "group-1", expiresAt: "2027-02-18" });
    },
    findActiveByHash: async () => null,
    getView: async () => {
      throw new Error("not used here");
    },
  };
  const tokens: TokenService = {
    generate: () => "test-personal-token",
    hash: (token) => `hash(${token})`,
  };
  const events: EventRepository = {
    append:
      config.appendThrows === true
        ? async () => {
            throw new Error("event store down");
          }
        : async () => {},
    readOwnerMetrics: async () => {
      throw new Error("not used here");
    },
  };
  return { deps: { groups, participants, tokens, events, appUrl: APP_URL }, joined };
}

describe("join-group (RF03, RF04, PAR-02)", () => {
  it("joins with a valid name and returns the one-time personal URL", async () => {
    const { deps, joined } = makeDeps({ invite: { groupId: "group-1", view: openGroup } });

    const result = await joinGroup({ inviteToken: "invite-abc", displayName: "  Ana  " }, deps);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      displayName: "Ana",
      personalUrl: `${APP_URL}/p/test-personal-token`,
      groupId: "group-1",
      expiresAt: "2027-02-18",
    });
    expect(joined.current).toEqual({
      inviteToken: "invite-abc",
      displayName: "Ana",
      accessTokenHash: "hash(test-personal-token)",
    });
  });

  it("rejects an empty name after trim with INVALID_INPUT", async () => {
    const { deps } = makeDeps({ invite: { groupId: "group-1", view: openGroup } });

    const result = await joinGroup({ inviteToken: "invite-abc", displayName: "   " }, deps);

    expect(result).toEqual(err({ code: "INVALID_INPUT" }));
  });

  it("rejects names longer than 40 characters with INVALID_INPUT", async () => {
    const { deps } = makeDeps({ invite: { groupId: "group-1", view: openGroup } });

    const result = await joinGroup(
      { inviteToken: "invite-abc", displayName: "a".repeat(41) },
      deps
    );

    expect(result).toEqual(err({ code: "INVALID_INPUT" }));
  });

  it("rejects a name containing HTML markup with INVALID_INPUT", async () => {
    const { deps } = makeDeps({ invite: { groupId: "group-1", view: openGroup } });

    const result = await joinGroup({ inviteToken: "invite-abc", displayName: "<b>Ana</b>" }, deps);

    expect(result).toEqual(err({ code: "INVALID_INPUT" }));
  });

  it("rejects an unknown invite token with INVALID_LINK", async () => {
    const { deps } = makeDeps({ invite: null });

    const result = await joinGroup({ inviteToken: "gone", displayName: "Ana" }, deps);

    expect(result).toEqual(err({ code: "INVALID_LINK" }));
  });

  it("refuses a drawn group with GROUP_CLOSED (RN04)", async () => {
    const { deps } = makeDeps({
      invite: { groupId: "group-1", view: { ...openGroup, status: "drawn" } },
    });

    const result = await joinGroup({ inviteToken: "invite-abc", displayName: "Ana" }, deps);

    expect(result).toEqual(err({ code: "GROUP_CLOSED" }));
  });

  it("propagates GROUP_FULL when the repository hits the 100-participant limit (RN09)", async () => {
    const { deps } = makeDeps({
      invite: { groupId: "group-1", view: openGroup },
      joinResult: async () => err({ code: "GROUP_FULL" }),
    });

    const result = await joinGroup({ inviteToken: "invite-abc", displayName: "Ana" }, deps);

    expect(result).toEqual(err({ code: "GROUP_FULL" }));
  });

  it("still succeeds when the metrics event fails (join never blocks on events)", async () => {
    const { deps } = makeDeps({
      invite: { groupId: "group-1", view: openGroup },
      appendThrows: true,
    });
    const appendSpy = vi.fn();
    deps.events.append = appendSpy;

    const result = await joinGroup({ inviteToken: "invite-abc", displayName: "Ana" }, deps);

    expect(result.ok).toBe(true);
    expect(appendSpy).toHaveBeenCalledWith({ groupId: "group-1", type: "participant_joined" });
  });
});
