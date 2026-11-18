"use server";

import { GROUP_MESSAGES, validateCreateGroup } from "./_lib/create-group-schema";
import type { CreateGroupInput, FieldErrors } from "./_lib/create-group-schema";
import { createGroupUseCase } from "./_lib/create-group-usecase";
import { JOIN_MESSAGES } from "./_lib/join-messages";
import { validateJoinGroup } from "./_lib/join-group-schema";
import type { JoinFieldErrors } from "./_lib/join-group-schema";
import { joinGroupUseCase } from "./_lib/participant-stubs";
import { setPersonalCookie } from "./_lib/personal-cookie";

export type CreateGroupActionResult =
  | { ok: true; inviteUrl: string; adminUrl: string }
  | { ok: false; errors?: FieldErrors; message?: string };

const CREATE_ERROR_MESSAGES: Record<string, string> = {
  IDEMPOTENCY_CONFLICT: GROUP_MESSAGES.conflict,
  RATE_LIMITED: GROUP_MESSAGES.rateLimited,
};

export async function createGroupAction(input: CreateGroupInput): Promise<CreateGroupActionResult> {
  const validated = validateCreateGroup(input);
  if (!validated.ok)
    return { ok: false, errors: validated.errors, message: GROUP_MESSAGES.generic };

  const result = await createGroupUseCase(validated.data);
  if (result.ok) return { ok: true, ...result.value };
  return { ok: false, message: CREATE_ERROR_MESSAGES[result.error.code] ?? GROUP_MESSAGES.generic };
}

export type JoinGroupActionResult =
  | {
      ok: true;
      displayName: string;
      personalUrl: string;
      groupId: string;
    }
  | { ok: false; errors?: JoinFieldErrors; message?: string; code?: string };

const JOIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_LINK: JOIN_MESSAGES.invalidLink,
  GROUP_CLOSED: JOIN_MESSAGES.groupClosed,
  GROUP_FULL: JOIN_MESSAGES.groupFull,
  RATE_LIMITED: JOIN_MESSAGES.rateLimited,
};

export async function joinGroupAction(input: {
  inviteToken: string;
  displayName: string;
}): Promise<JoinGroupActionResult> {
  const validated = validateJoinGroup(input);
  if (!validated.ok) {
    return { ok: false, errors: validated.errors, message: JOIN_MESSAGES.generic };
  }

  const result = await joinGroupUseCase(validated.data);
  if (!result.ok) {
    return {
      ok: false,
      message: JOIN_ERROR_MESSAGES[result.error.code] ?? JOIN_MESSAGES.generic,
      code: result.error.code,
    };
  }

  await setPersonalCookie({
    groupId: result.value.groupId,
    accessToken: result.value.accessToken,
    expiresAt: result.value.expiresAt,
  });

  return {
    ok: true,
    displayName: result.value.displayName,
    personalUrl: result.value.personalUrl,
    groupId: result.value.groupId,
  };
}
