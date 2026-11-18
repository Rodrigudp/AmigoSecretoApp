// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import {
  clearStubJoins,
  getInviteViewUseCase,
  joinGroupUseCase,
  resolvePersonalAccessUseCase,
} from "@/app/_lib/participant-stubs";
import { accessTokensEqual } from "@/app/_lib/access-token";
import { JOIN_MESSAGES } from "@/app/_lib/join-messages";
import { validateJoinGroup } from "@/app/_lib/join-group-schema";
import { buildPersonalLinkMessage } from "@/app/_lib/whatsapp";

afterEach(() => clearStubJoins());

describe("participant stubs (PAR-03)", () => {
  it("getInviteView returns an open group for a normal invite", async () => {
    const result = await getInviteViewUseCase({ inviteToken: "invite-ok" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.group.status).toBe("open");
    expect(result.value.isFull).toBe(false);
    expect(result.value.returningParticipant).toBeNull();
  });

  it("getInviteView maps closed and full and invalid tokens", async () => {
    const closed = await getInviteViewUseCase({ inviteToken: "x__closed" });
    expect(closed.ok && closed.value.group.status).toBe("drawn");

    const full = await getInviteViewUseCase({ inviteToken: "x__full" });
    expect(full.ok && full.value.isFull).toBe(true);

    const invalid = await getInviteViewUseCase({ inviteToken: "x__invalid" });
    expect(invalid).toEqual({ ok: false, error: { code: "INVALID_LINK" } });
  });

  it("join returns a personal URL and resolve finds it; resume name matches", async () => {
    const joined = await joinGroupUseCase({ inviteToken: "invite-ok", displayName: " Ana " });
    expect(joined.ok).toBe(true);
    if (!joined.ok) return;

    expect(joined.value.personalUrl).toContain(`/p/${joined.value.accessToken}`);
    const resolved = await resolvePersonalAccessUseCase(joined.value.accessToken);
    expect(resolved.ok && resolved.value.displayName).toBe("Ana");

    const view = await getInviteViewUseCase({
      inviteToken: "invite-ok",
      resumeAccessToken: joined.value.accessToken,
    });
    expect(view.ok && view.value.returningParticipant).toEqual({ displayName: "Ana" });
  });

  it("join refuses closed and full invites", async () => {
    expect(await joinGroupUseCase({ inviteToken: "a__closed", displayName: "Ana" })).toEqual({
      ok: false,
      error: { code: "GROUP_CLOSED" },
    });
    expect(await joinGroupUseCase({ inviteToken: "a__full", displayName: "Ana" })).toEqual({
      ok: false,
      error: { code: "GROUP_FULL" },
    });
  });
});

describe("join validation and helpers", () => {
  it("validateJoinGroup accepts a trimmed name and rejects HTML", () => {
    expect(validateJoinGroup({ inviteToken: "t", displayName: "  Ana  " })).toEqual({
      ok: true,
      data: { inviteToken: "t", displayName: "Ana" },
    });
    const bad = validateJoinGroup({ inviteToken: "t", displayName: "<b>Ana</b>" });
    expect(bad.ok).toBe(false);
    if (bad.ok) return;
    expect(bad.errors.displayName).toBe(JOIN_MESSAGES.nameHtml);
  });

  it("accessTokensEqual is true only for the same token", () => {
    expect(accessTokensEqual("abc", "abc")).toBe(true);
    expect(accessTokensEqual("abc", "abd")).toBe(false);
  });

  it("buildPersonalLinkMessage includes the URL", () => {
    expect(buildPersonalLinkMessage("https://x.test/p/t")).toContain("https://x.test/p/t");
  });
});
