"use server";

import type { DomainErrorCode } from "@/src/domain/errors";
import { removeParticipantUseCase, runDrawUseCase } from "./_lib/admin-usecase";
import { copy } from "./_lib/copy";

export type RemoveParticipantActionResult =
  { ok: true; participantCount: number } | { ok: false; message: string };

export type RunDrawActionResult =
  { ok: true; drawnAt: string } | { ok: false; code?: DomainErrorCode; message: string };

const ADMIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_LINK: copy.CNV_10.text,
  GROUP_CLOSED: copy.ADM_11,
  PARTICIPANT_NOT_FOUND: copy.ADM_11,
};

const DRAW_ERROR_MESSAGES: Partial<Record<DomainErrorCode, string>> = {
  INVALID_LINK: copy.DRW_09.text,
  NOT_ENOUGH_PARTICIPANTS: copy.DRW_03,
  DRAW_MEMBERS_CHANGED: copy.DRW_08.text,
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

export async function runDrawAction(
  adminToken: string,
  expectedParticipantCount?: number
): Promise<RunDrawActionResult> {
  const result = await runDrawUseCase(adminToken, expectedParticipantCount);
  if (result.ok) {
    return { ok: true, drawnAt: result.value.drawnAt };
  }
  return {
    ok: false,
    code: result.error.code,
    message: DRAW_ERROR_MESSAGES[result.error.code] ?? copy.DRW_07,
  };
}
