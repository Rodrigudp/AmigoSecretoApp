import type { ParticipantView, GroupId } from "@/src/application/ports";

export type ResolvedAccess = {
  view: ParticipantView;
  groupId: GroupId;
  expiresAt: string;
};

export type AccessDecision =
  | { kind: "invalid" }
  | { kind: "canonical"; groupId: GroupId }
  | { kind: "probe"; accessToken: string }
  | { kind: "fallback"; access: ResolvedAccess };

/**
 * Constant-time comparison of two same-purpose strings (cookie vs URL token).
 * Compares byte by byte over the longest length and folds all differences into
 * one bit, so the number of loop iterations does not depend on the prefix match.
 */
export function isSameToken(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let index = 0; index < maxLength; index += 1) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return diff === 0;
}

/**
 * ADR-004 handshake for `GET /p/<accessToken>`, as a pure decision:
 * 1. token invalid -> neutral INVALID_LINK;
 * 2. cookie ptk_<groupId> equals the URL token (timing-safe) -> canonical
 *    `/p/g/<groupId>` (URL wins over a stale cookie of another person);
 * 3. no `?ck=1` yet -> probe: the route handler sets the cookie and redirects
 *    back to `/p/<accessToken>?ck=1`;
 * 4. `?ck=1` with a cookie that still equals the URL token -> cookies work ->
 *    canonical `/p/g/<groupId>`;
 * 5. `?ck=1` without a cookie, or with a cookie of ANOTHER person (shared
 *    device / stale cookie: the URL token must win, never the cookie) ->
 *    fallback render on `/p/<accessToken>?ck=1` with adsAllowed = false.
 */
export function decideParticipantAccess(input: {
  accessToken: string;
  ck: boolean;
  cookieValue: string | null;
  resolved: ResolvedAccess | null;
}): AccessDecision {
  const { accessToken, ck, cookieValue, resolved } = input;

  if (!resolved) {
    return { kind: "invalid" };
  }
  if (cookieValue && isSameToken(cookieValue, accessToken)) {
    return { kind: "canonical", groupId: resolved.groupId };
  }
  if (!ck) {
    return { kind: "probe", accessToken };
  }
  // After the probe (?ck=1), canonical only when the cookie is the URL token.
  // A cookie of another person must never take over the URL (shared device):
  // the PAR-04 area reads the view from the cookie, so redirecting would show
  // someone else's data. Fallback renders the URL token's view, no ads.
  return { kind: "fallback", access: resolved };
}
