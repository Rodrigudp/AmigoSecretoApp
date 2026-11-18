import "server-only";
import type { CreateGroupDeps } from "../../application/create-group";
import type { JoinGroupDeps } from "../../application/join-group";
import { env } from "../../shared/env";
import { tokenService } from "../tokens";
import { createServerClient } from "./client";
import { createGroupRepository } from "./group-repository";
import { createParticipantRepository } from "./participant-repository";

export function buildCreateGroupDeps(): CreateGroupDeps {
  const client = createServerClient();
  return {
    groups: createGroupRepository(client),
    tokens: tokenService,
    clock: { now: () => new Date() },
    appUrl: env.APP_URL,
  };
}

export function buildJoinGroupDeps(): JoinGroupDeps {
  const client = createServerClient();
  return {
    groups: createGroupRepository(client),
    participants: createParticipantRepository(client),
    tokens: tokenService,
    appUrl: env.APP_URL,
  };
}

export function buildInviteClient() {
  return createServerClient();
}
