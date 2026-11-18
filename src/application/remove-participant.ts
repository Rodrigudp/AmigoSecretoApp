import { err, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type { GroupRepository, TokenService } from "./ports";
import {
  removeParticipantInputSchema,
  type RemoveParticipantInput,
} from "./schemas/admin";

export type { RemoveParticipantInput };

export type RemoveParticipantDeps = {
  groups: GroupRepository;
  tokens: TokenService;
};

/**
 * RF07, RN04, RN06: Admin removes a participant from an open group (GRP-05).
 *
 * 1. Validates input schema (adminToken and participantId).
 * 2. Hashes the admin token with SHA-256 (SEC-01).
 * 3. Resolves the admin scope. Invalid or unknown token returns INVALID_LINK (ADR-002).
 * 4. Delegates soft-delete and draw-state check to the repository.
 *    Rejects with GROUP_CLOSED if draw already took place (RN04).
 *    Rejects with PARTICIPANT_NOT_FOUND if participant is not in group or already removed.
 * 5. Returns updated participant count.
 */
export async function removeParticipant(
  input: unknown,
  deps: RemoveParticipantDeps
): Promise<Result<{ participantCount: number }, DomainError>> {
  const parsed = removeParticipantInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const adminTokenHash = deps.tokens.hash(parsed.data.adminToken);
  const adminScope = await deps.groups.findAdminByHash(adminTokenHash);
  if (!adminScope) {
    return err({ code: "INVALID_LINK" });
  }

  return deps.groups.removeParticipant(adminScope, parsed.data.participantId);
}
