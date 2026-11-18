// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  decideParticipantAccess,
  isSameToken,
  type ResolvedAccess,
} from "../../app/_lib/participant-access";

const access = (groupId: string): ResolvedAccess => ({
  groupId,
  expiresAt: "2027-02-18",
  view: {
    displayName: "Ana",
    group: {
      name: "Família",
      maxValueCents: 5000,
      exchangeDate: "2026-12-20",
      location: null,
      status: "open",
    },
    ownWishItems: [],
  },
});

describe("participant access handshake (ADR-004, PAR-04)", () => {
  it("returns invalid for an unknown token without revealing the group", () => {
    const decision = decideParticipantAccess({
      accessToken: "gone",
      ck: false,
      cookieValue: null,
      resolved: null,
    });

    expect(decision).toEqual({ kind: "invalid" });
  });

  it("goes to the canonical cookie route when the cookie matches the URL token", () => {
    const decision = decideParticipantAccess({
      accessToken: "tok-1",
      ck: false,
      cookieValue: "tok-1",
      resolved: access("g-1"),
    });

    expect(decision).toEqual({ kind: "canonical", groupId: "g-1" });
  });

  it("probes the cookie when there is no cookie yet (sem cookie)", () => {
    const decision = decideParticipantAccess({
      accessToken: "tok-1",
      ck: false,
      cookieValue: null,
      resolved: access("g-1"),
    });

    expect(decision).toEqual({ kind: "probe", accessToken: "tok-1" });
  });

  it("lets the URL token win when the cookie belongs to another person (cookie de outro grupo)", () => {
    const decision = decideParticipantAccess({
      accessToken: "tok-mine",
      ck: false,
      cookieValue: "tok-other-person",
      resolved: access("g-1"),
    });

    expect(decision).toEqual({ kind: "probe", accessToken: "tok-mine" });
  });

  it("goes to the canonical route on the second pass with a cookie (?ck=1)", () => {
    const decision = decideParticipantAccess({
      accessToken: "tok-1",
      ck: true,
      cookieValue: "tok-1",
      resolved: access("g-1"),
    });

    expect(decision).toEqual({ kind: "canonical", groupId: "g-1" });
  });

  it("falls back without ads when ?ck=1 returns a cookie of another person (shared device)", () => {
    const resolved = access("g-1");
    const decision = decideParticipantAccess({
      accessToken: "tok-mine",
      ck: true,
      cookieValue: "tok-other-person",
      resolved,
    });

    // The cookie must never win over the URL token after the probe: the area
    // renders from the cookie, so canonicalizing would show another person.
    expect(decision).toEqual({ kind: "fallback", access: resolved });
  });

  it("renders the fallback without ads when the WebView blocked the cookie", () => {
    const resolved = access("g-1");
    const decision = decideParticipantAccess({
      accessToken: "tok-1",
      ck: true,
      cookieValue: null,
      resolved,
    });

    expect(decision).toEqual({ kind: "fallback", access: resolved });
  });

  it("keeps a drawn group accessible through the same handshake (grupo sorteado)", () => {
    const drawn: ResolvedAccess = {
      ...access("g-1"),
      view: {
        ...access("g-1").view,
        group: { ...access("g-1").view.group, status: "drawn" },
      },
    };

    const decision = decideParticipantAccess({
      accessToken: "tok-1",
      ck: true,
      cookieValue: null,
      resolved: drawn,
    });

    expect(decision).toEqual({ kind: "fallback", access: drawn });
    expect(decision.kind === "fallback" && decision.access.view.group.status).toBe("drawn");
  });

  it("compares tokens in constant time (length and content folded into one bit)", () => {
    expect(isSameToken("abc", "abc")).toBe(true);
    expect(isSameToken("abc", "abd")).toBe(false);
    expect(isSameToken("abc", "abcd")).toBe(false);
    expect(isSameToken("", "")).toBe(true);
    expect(isSameToken("abc", "")).toBe(false);
  });
});
