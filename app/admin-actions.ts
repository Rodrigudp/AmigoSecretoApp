"use server";

import { removeParticipantUseCase } from "./_lib/admin-usecase";
import { copy } from "./_lib/copy";

export type RemoveParticipantActionResult =
  { ok: true; participantCount: number } | { ok: false; message: string };

const ADMIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_LINK: copy.CNV_10.text,
  GROUP_CLOSED: copy.ADM_11,
  PARTICIPANT_NOT_FOUND: copy.ADM_11,
};

export async function removeParticipantAction(
  adminToken: string,
  participantId: string
): Promise<RemoveParticipantActionResult> {
  const result = await removeParticipantUseCase(adminToken, participantId);
  if (result.ok) {
    return { ok: true, participantCount: result.value.participantCount };
  }
  return {
    ok: false,
    message: ADMIN_ERROR_MESSAGES[result.error.code] ?? copy.ADM_11,
  };
}
