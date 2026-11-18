// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const headersMock = vi.hoisted(() => vi.fn<() => Promise<Headers>>());
vi.mock("next/headers", () => ({ headers: headersMock }));
vi.mock("../../app/_lib/personal-cookie", () => ({ setPersonalCookie: vi.fn() }));
vi.mock("../../app/_lib/create-group-usecase", () => ({
  createGroupUseCase: vi.fn(async () => ({
    ok: true,
    value: { inviteUrl: "https://x/g/1", adminUrl: "https://x/admin/2" },
  })),
}));
vi.mock("../../app/_lib/participant-stubs", () => ({
  joinGroupUseCase: vi.fn(async () => ({
    ok: true,
    value: {
      displayName: "Ana",
      personalUrl: "https://x/p/tok",
      groupId: "g-1",
      expiresAt: "2099-01-01T00:00:00.000Z",
      accessToken: "tok",
    },
  })),
}));
vi.mock("../../app/_lib/admin-usecase", () => ({
  removeParticipantUseCase: vi.fn(),
  runDrawUseCase: vi.fn(async () => ({
    ok: true,
    value: { drawnAt: "2026-11-18T12:00:00.000Z", drawVersion: 1 },
  })),
}));

import { createGroupAction, joinGroupAction } from "../../app/actions";
import { runDrawAction } from "../../app/admin-actions";
import { copy } from "../../app/_lib/copy";
import { GROUP_MESSAGES } from "../../app/_lib/create-group-schema";
import { JOIN_MESSAGES } from "../../app/_lib/join-messages";
import {
  DEFAULT_RATE_LIMIT_POLICIES,
  getSharedRateLimiter,
} from "../../src/infrastructure/rate-limit";

describe("server actions rate limiting (SEC-03, SEC05-M01)", () => {
  beforeEach(() => {
    getSharedRateLimiter().reset();
    headersMock.mockResolvedValue(new Headers({ "x-real-ip": "198.51.100.77" }));
  });

  it("blocks createGroupAction after exceeding the IP limit", async () => {
    const input = {
      name: "Grupo Teste",
      maxValue: "50,00",
      exchangeDate: "2099-12-24",
      location: "",
      requestId: "3b241101-e2bb-4255-8caf-4136c566a962",
    };
    for (let i = 0; i < DEFAULT_RATE_LIMIT_POLICIES.create_group.limit; i += 1) {
      expect((await createGroupAction(input)).ok).toBe(true);
    }
    expect(await createGroupAction(input)).toEqual({
      ok: false,
      message: GROUP_MESSAGES.rateLimited,
    });
  });

  it("blocks joinGroupAction after exceeding the IP limit", async () => {
    const input = { inviteToken: "invite_token_0123456789", displayName: "Ana" };
    for (let i = 0; i < DEFAULT_RATE_LIMIT_POLICIES.join_group.limit; i += 1) {
      expect((await joinGroupAction(input)).ok).toBe(true);
    }
    expect(await joinGroupAction(input)).toEqual({
      ok: false,
      message: JOIN_MESSAGES.rateLimited,
      code: "RATE_LIMITED",
    });
  });

  it("blocks runDrawAction after exceeding the IP limit", async () => {
    for (let i = 0; i < DEFAULT_RATE_LIMIT_POLICIES.run_draw.limit; i += 1) {
      expect((await runDrawAction("admin_token_0123456789", 3)).ok).toBe(true);
    }
    expect(await runDrawAction("admin_token_0123456789", 3)).toEqual({
      ok: false,
      code: "RATE_LIMITED",
      message: copy.GLB_09,
    });
  });
});
