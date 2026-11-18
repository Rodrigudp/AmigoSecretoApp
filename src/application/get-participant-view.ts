import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type { GroupId, ParticipantRepository, ParticipantView, TokenService } from "./ports";

export type GetParticipantViewInput = { accessToken: string };

export type GetParticipantViewOutput = {
  view: ParticipantView;
  /** Group id for the canonical cookie route `/p/g/<groupId>` and `ptk_<groupId>` (ADR-004). */
  groupId: GroupId;
  /** Group expiration (exchange date + 60 days, RN08) used as cookie expiry. */
  expiresAt: string;
};

export type GetParticipantViewDeps = {
  participants: ParticipantRepository;
  tokens: TokenService;
};

/**
 * RF04: resolves the participant area (PAR-04) from the personal access token.
 * The raw token only circulates in the link; it is hashed (SHA-256) before any
 * lookup and the repository resolves the active participant by hash (ADR-002).
 * Returns INVALID_LINK for unknown/removed participants without revealing
 * whether the group exists.
 */
export async function getParticipantView(
  input: GetParticipantViewInput,
  deps: GetParticipantViewDeps
): Promise<Result<GetParticipantViewOutput, DomainError>> {
  const accessToken = typeof input.accessToken === "string" ? input.accessToken.trim() : "";
  if (accessToken.length === 0) {
    return err({ code: "INVALID_LINK" });
  }

  const active = await deps.participants.findActiveByHash(deps.tokens.hash(accessToken));
  if (!active) {
    return err({ code: "INVALID_LINK" });
  }

  const view = await deps.participants.getView({
    participantId: active.participantId,
    accessTokenHash: active.accessTokenHash,
  });
  if (!view.ok) {
    return err(view.error);
  }

  return ok({
    view: view.value,
    groupId: active.groupId,
    expiresAt: active.expiresAt,
  });
}
