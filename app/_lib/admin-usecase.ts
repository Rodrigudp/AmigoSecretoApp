import type { AdminGroup } from "@/src/application/ports";
import { getAdminView } from "@/src/application/get-admin-view";
import { removeParticipant } from "@/src/application/remove-participant";
import type { Result } from "@/src/shared/result";
import type { DomainError } from "@/src/domain/errors";

/** RF06: admin panel via Supabase GroupRepository (service role). */
export async function getAdminViewUseCase(
  adminToken: string
): Promise<Result<AdminGroup, DomainError>> {
  const { buildAdminDeps } = await import("@/src/infrastructure/supabase/deps");
  return getAdminView({ adminToken }, buildAdminDeps());
}

/** RF07: soft-remove an active participant while the group is open. */
export async function removeParticipantUseCase(
  adminToken: string,
  participantId: string
): Promise<Result<{ participantCount: number }, DomainError>> {
  const { buildAdminDeps } = await import("@/src/infrastructure/supabase/deps");
  return removeParticipant({ adminToken, participantId }, buildAdminDeps());
}
