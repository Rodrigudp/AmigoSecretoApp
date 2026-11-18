"use server";

import { removeParticipantUseCase } from "./_lib/admin-usecase";

export type RemoveParticipantActionResult =
  | { ok: true; participantCount: number }
  | { ok: false; message: string };

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
