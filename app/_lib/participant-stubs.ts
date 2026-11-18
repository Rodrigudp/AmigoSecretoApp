import { err, ok, type Result } from "@/src/shared/result";
import type { DomainError } from "@/src/domain/errors";
import type { GroupId, PublicGroup } from "@/src/application/ports";

export type InviteView = {
  groupId: GroupId;
  group: PublicGroup;
  isFull: boolean;
  returningParticipant: { displayName: string } | null;
  expiresAt: string;
};

export type JoinStubOutput = {
  displayName: string;
  personalUrl: string;
  groupId: GroupId;
  expiresAt: string;
  accessToken: string;
};

export type PersonalAccess = {
  groupId: GroupId;
  displayName: string;
  expiresAt: string;
  group: PublicGroup;
};

type StoredJoin = {
  inviteToken: string;
  groupId: GroupId;
  displayName: string;
  expiresAt: string;
  group: PublicGroup;
};

/** Process-local store for PAR-04 personal-area stubs only. */
const joinsByAccessToken = new Map<string, StoredJoin>();

const MAX_PARTICIPANTS = 100;

/** RF02/RF03: invite view from groups (no in-memory map). */
export async function getInviteViewUseCase(input: {
  inviteToken: string;
  resumeAccessToken?: string;
  /** When true, records invite_opened. Metadata/crawlers must pass false. */
  recordOpened?: boolean;
}): Promise<Result<InviteView, DomainError>> {
  const { buildInviteClient } = await import("@/src/infrastructure/supabase/deps");
  const {
    createGroupRepository,
    countActiveParticipants,
    recordInviteOpened,
    findReturningDisplayName,
    readGroupExpiresAt,
  } = await import("@/src/infrastructure/supabase/group-repository");
  const { tokenService } = await import("@/src/infrastructure/tokens");

  const client = buildInviteClient();
  const groups = createGroupRepository(client);
  const found = await groups.findByInvite(input.inviteToken);
  if (!found) {
    return err({ code: "INVALID_LINK" });
  }

  if (input.recordOpened) {
    await recordInviteOpened(client, found.groupId);
  }

  const [activeCount, expiresAt] = await Promise.all([
    countActiveParticipants(client, found.groupId),
    readGroupExpiresAt(client, found.groupId),
  ]);
  if (!expiresAt) {
    return err({ code: "INVALID_LINK" });
  }

  let returningParticipant: InviteView["returningParticipant"] = null;
  if (input.resumeAccessToken) {
    const displayName = await findReturningDisplayName(
      client,
      found.groupId,
      tokenService.hash(input.resumeAccessToken)
    );
    if (displayName) {
      returningParticipant = { displayName };
    }
  }

  return ok({
    groupId: found.groupId,
    group: found.view,
    isFull: activeCount >= MAX_PARTICIPANTS,
    returningParticipant,
    expiresAt,
  });
}

/** RF03/RF04: join via join_group RPC; returns personal link + raw token for the cookie. */
export async function joinGroupUseCase(input: {
  inviteToken: string;
  displayName: string;
}): Promise<Result<JoinStubOutput, DomainError>> {
  const { joinGroup } = await import("@/src/application/join-group");
  const { buildJoinGroupDeps } = await import("@/src/infrastructure/supabase/deps");

  const deps = buildJoinGroupDeps();
  const result = await joinGroup(input, deps);
  if (!result.ok) {
    return result;
  }

  const prefix = `${deps.appUrl.replace(/\/+$/, "")}/p/`;
  const accessToken = result.value.personalUrl.startsWith(prefix)
    ? result.value.personalUrl.slice(prefix.length)
    : (result.value.personalUrl.split("/").pop() ?? "");

  return ok({
    displayName: result.value.displayName,
    personalUrl: result.value.personalUrl,
    groupId: result.value.groupId,
    expiresAt: result.value.expiresAt,
    accessToken,
  });
}

// TODO(PAR-04): replace with findActiveByHash / get-participant-view adapter.
export async function resolvePersonalAccessUseCase(
  accessToken: string
): Promise<Result<PersonalAccess, DomainError>> {
  const stored = joinsByAccessToken.get(accessToken);
  if (!stored) return err({ code: "INVALID_LINK" });
  return ok({
    groupId: stored.groupId,
    displayName: stored.displayName,
    expiresAt: stored.expiresAt,
    group: stored.group,
  });
}

/** Test helper: seed a personal access token into the stub store. */
export function seedStubPersonalAccess(
  accessToken: string,
  data: Omit<StoredJoin, "inviteToken"> & { inviteToken?: string }
): void {
  joinsByAccessToken.set(accessToken, {
    inviteToken: data.inviteToken ?? "invite-demo",
    groupId: data.groupId,
    displayName: data.displayName,
    expiresAt: data.expiresAt,
    group: data.group,
  });
}

export function clearStubJoins(): void {
  joinsByAccessToken.clear();
}
