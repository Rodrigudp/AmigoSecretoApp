import "server-only";
import type { CreateGroupDeps } from "../../application/create-group";
import type { GetAdminViewDeps } from "../../application/get-admin-view";
import type { GetParticipantViewDeps } from "../../application/get-participant-view";
import type { JoinGroupDeps } from "../../application/join-group";
import type { WishItemRepository } from "../../application/ports";
import type { RemoveParticipantDeps } from "../../application/remove-participant";
import { env } from "../../shared/env";
import { tokenService } from "../tokens";
import { createServerClient } from "./client";
import { createGroupRepository } from "./group-repository";
import { createParticipantRepository } from "./participant-repository";
import { createWishItemRepository } from "./wish-item-repository";

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

export function buildAdminDeps(): GetAdminViewDeps & RemoveParticipantDeps {
  const client = createServerClient();
  return {
    groups: createGroupRepository(client),
    tokens: tokenService,
    appUrl: env.APP_URL,
  };
}

export function buildParticipantViewDeps(): GetParticipantViewDeps {
  const client = createServerClient();
  return {
    participants: createParticipantRepository(client),
    tokens: tokenService,
  };
}

export function buildWishItemRepository(): WishItemRepository {
  return createWishItemRepository(createServerClient());
}

export function buildInviteClient() {
  return createServerClient();
}
