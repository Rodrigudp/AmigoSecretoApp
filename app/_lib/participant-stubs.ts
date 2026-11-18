import { createHash, randomBytes } from "node:crypto";
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

/** Process-local store so the stub can resolve personal links and "Continuar como". */
const joinsByAccessToken = new Map<string, StoredJoin>();

function appOrigin(): string {
  return process.env.APP_URL ?? "https://amigo-secreto-app-five.vercel.app";
}

function groupIdForInvite(inviteToken: string): GroupId {
  return createHash("sha256").update(`invite:${inviteToken}`).digest("hex").slice(0, 32);
}

function expiresAtIso(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 60);
  return date.toISOString();
}

function demoGroup(status: PublicGroup["status"]): PublicGroup {
  return {
    name: "Amigo Secreto da Família",
    maxValueCents: 5000,
    exchangeDate: "2099-12-24",
    location: "Casa da Vó",
    status,
  };
}

function inviteKind(inviteToken: string): "invalid" | "closed" | "full" | "open" {
  if (!inviteToken || inviteToken.endsWith("__invalid")) return "invalid";
  if (inviteToken.endsWith("__closed")) return "closed";
  if (inviteToken.endsWith("__full")) return "full";
  return "open";
}

// TODO(BE-01): replace with the real get-invite-view use case + Supabase adapter (one-line swap).
export async function getInviteViewUseCase(input: {
  inviteToken: string;
  resumeAccessToken?: string;
}): Promise<Result<InviteView, DomainError>> {
  const kind = inviteKind(input.inviteToken);
  if (kind === "invalid") return err({ code: "INVALID_LINK" });

  const groupId = groupIdForInvite(input.inviteToken);
  const group = demoGroup(kind === "closed" ? "drawn" : "open");
  const expiresAt = expiresAtIso();
  let returningParticipant: InviteView["returningParticipant"] = null;

  if (input.resumeAccessToken) {
    const stored = joinsByAccessToken.get(input.resumeAccessToken);
    if (stored && stored.groupId === groupId) {
      returningParticipant = { displayName: stored.displayName };
    }
  }

  return ok({
    groupId,
    group,
    isFull: kind === "full",
    returningParticipant,
    expiresAt,
  });
}

// TODO(BE-01): replace with joinGroup() + Supabase adapter (one-line swap).
export async function joinGroupUseCase(input: {
  inviteToken: string;
  displayName: string;
}): Promise<Result<JoinStubOutput, DomainError>> {
  const kind = inviteKind(input.inviteToken);
  if (kind === "invalid") return err({ code: "INVALID_LINK" });
  if (kind === "closed") return err({ code: "GROUP_CLOSED" });
  if (kind === "full") return err({ code: "GROUP_FULL" });

  const accessToken = randomBytes(32).toString("base64url");
  const groupId = groupIdForInvite(input.inviteToken);
  const group = demoGroup("open");
  const expiresAt = expiresAtIso();
  const displayName = input.displayName.trim();

  joinsByAccessToken.set(accessToken, {
    inviteToken: input.inviteToken,
    groupId,
    displayName,
    expiresAt,
    group,
  });

  return ok({
    displayName,
    personalUrl: `${appOrigin()}/p/${accessToken}`,
    groupId,
    expiresAt,
    accessToken,
  });
}

// TODO(BE-01): replace with findActiveByHash / get-participant-view adapter.
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
