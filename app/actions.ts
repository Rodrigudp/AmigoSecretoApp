"use server";

import { GROUP_MESSAGES, validateCreateGroup } from "./_lib/create-group-schema";
import type { CreateGroupInput, FieldErrors } from "./_lib/create-group-schema";
import { createGroupUseCase } from "./_lib/create-group-usecase";
import { removeParticipantUseCase } from "./_lib/admin-usecase";

export type CreateGroupActionResult =
  | { ok: true; inviteUrl: string; adminUrl: string }
  | { ok: false; errors?: FieldErrors; message?: string };

export type RemoveParticipantActionResult =
  | { ok: true; participantCount: number }
  | { ok: false; message: string };

const ERROR_MESSAGES: Record<string, string> = {
  IDEMPOTENCY_CONFLICT: GROUP_MESSAGES.conflict,
  RATE_LIMITED: GROUP_MESSAGES.rateLimited,
};

export async function createGroupAction(input: CreateGroupInput): Promise<CreateGroupActionResult> {
  const validated = validateCreateGroup(input);
  if (!validated.ok)
    return { ok: false, errors: validated.errors, message: GROUP_MESSAGES.generic };

  const result = await createGroupUseCase(validated.data);
  if (result.ok) return { ok: true, ...result.value };
  return { ok: false, message: ERROR_MESSAGES[result.error.code] ?? GROUP_MESSAGES.generic };
}

const ADMIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_LINK: "Este link é inválido ou não está mais disponível.",
  GROUP_CLOSED: "Não é possível remover participantes após a realização do sorteio.",
  PARTICIPANT_NOT_FOUND: "Participante não encontrado neste grupo.",
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
    message: ADMIN_ERROR_MESSAGES[result.error.code] ?? "Não foi possível remover o participante. Tente novamente.",
  };
}
