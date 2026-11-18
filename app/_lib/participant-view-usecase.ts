import type { DomainError } from "@/src/domain/errors";
import type { GroupId } from "@/src/application/ports";
import { getParticipantView } from "@/src/application/get-participant-view";
import type { GetParticipantViewOutput } from "@/src/application/get-participant-view";
import type { Result } from "@/src/shared/result";

/**
 * RF04 / ADR-004: resolves the participant area from a personal access token.
 * Hashes the raw token before lookup; removed/expired tokens return INVALID_LINK.
 */
export async function resolveParticipantByToken(
  accessToken: string
): Promise<Result<GetParticipantViewOutput, DomainError>> {
  const { buildParticipantViewDeps } = await import("@/src/infrastructure/supabase/deps");
  return getParticipantView({ accessToken }, buildParticipantViewDeps());
}

export function cookieNameFor(groupId: GroupId): string {
  return `ptk_${groupId}`;
}
