"use server";

import { GROUP_MESSAGES, validateCreateGroup } from "./_lib/create-group-schema";
import type { CreateGroupInput, FieldErrors } from "./_lib/create-group-schema";
import { createGroupUseCase } from "./_lib/create-group-usecase";

export type CreateGroupActionResult =
  | { ok: true; inviteUrl: string; adminUrl: string }
  | { ok: false; errors?: FieldErrors; message?: string };

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
