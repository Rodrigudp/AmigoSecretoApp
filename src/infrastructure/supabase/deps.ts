import "server-only";
import type { CreateGroupDeps } from "../../application/create-group";
import type { GetAdminViewDeps } from "../../application/get-admin-view";
import type { GetMyResultDeps } from "../../application/get-my-result";
import type { GetParticipantViewDeps } from "../../application/get-participant-view";
import type { JoinGroupDeps } from "../../application/join-group";
import type { WishItemRepository } from "../../application/ports";
import type { RemoveParticipantDeps } from "../../application/remove-participant";
import type { RunDrawDeps } from "../../application/run-draw";
import { env } from "../../shared/env";
import { secureRandomInt } from "../random";
import { tokenService } from "../tokens";
import { createServerClient } from "./client";
import { createDrawRepository } from "./draw-repository";
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

export function buildAdminDeps(): GetAdminViewDeps & RemoveParticipantDeps & RunDrawDeps {
  const client = createServerClient();
  return {
    groups: createGroupRepository(client),
    draws: createDrawRepository(client),
    tokens: tokenService,
    rng: secureRandomInt,
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

export function buildGetMyResultDeps(): GetMyResultDeps {
  const client = createServerClient();
  return {
    participants: createParticipantRepository(client),
    draws: createDrawRepository(client),
    tokens: tokenService,
    events: {
      async append(event) {
        await client.from("events").insert({ group_id: event.groupId, type: event.type });
      },
    },
  };
}

import { CompositeAffiliateLinkService } from "../affiliates/affiliate-adapters";

export function buildWishItemRepository(): WishItemRepository {
  return createWishItemRepository(createServerClient());
}

export function buildAffiliateLinkService() {
  return new CompositeAffiliateLinkService();
}

export function buildEventAppendService() {
  const client = createServerClient();
  return {
    async append(event: { groupId: string; type: import("../../application/ports").EventType }) {
      await client.from("events").insert({ group_id: event.groupId, type: event.type });
    },
  };
}

export function buildInviteClient() {
  return createServerClient();
}
