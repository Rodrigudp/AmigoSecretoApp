import { createHash, randomBytes } from "node:crypto";
import type { AdminGroup, AdminScope, GroupRepository, ParticipantId, TokenService } from "@/src/application/ports";
import { getAdminView } from "@/src/application/get-admin-view";
import { removeParticipant } from "@/src/application/remove-participant";
import { err, ok, type Result } from "@/src/shared/result";
import type { DomainError } from "@/src/domain/errors";

const hashToken = (token: string) => createHash("sha256").update(token, "utf8").digest("hex");
const localTokenService: TokenService = {
  generate: () => randomBytes(32).toString("base64url"),
  hash: hashToken,
};

export const DEMO_ADMIN_TOKEN = "demo-admin-token";

// In-memory store for development/preview until BE-01 / DB-05 adapters are merged.
// Only explicitly registered tokens exist (ADR-002, RNF03: unknown tokens return INVALID_LINK).
// TODO(BE-01/DB-05): Replace stub repository with real Supabase adapter once merged.
type StoredGroup = {
  id: string;
  details: AdminGroup["group"];
  inviteToken: string;
  draw: AdminGroup["draw"];
  participants: { id: ParticipantId; displayName: string; joinedAt: string; removedAt?: string }[];
};

const store = new Map<string, StoredGroup>();

function initStore() {
  const demoHash = hashToken(DEMO_ADMIN_TOKEN);
  if (!store.has(demoHash)) {
    store.set(demoHash, {
      id: "grp-demo",
      details: { name: "Amigo Secreto da Galera", maxValueCents: 5000, exchangeDate: "2026-12-24", location: "Casa do João" },
      inviteToken: "convite-secreto-123",
      draw: { status: "open" },
      participants: [
        { id: "p-1", displayName: "Ana Clara", joinedAt: "2026-11-17T14:30:00Z" },
        { id: "p-2", displayName: "Carlos Eduardo", joinedAt: "2026-11-17T14:35:00Z" },
        { id: "p-3", displayName: "Beatriz Lima", joinedAt: "2026-11-17T14:40:00Z" },
      ],
    });
  }
}
initStore();

export function registerStubGroup(adminToken: string, group: Omit<StoredGroup, "id"> & { id?: string }) {
  store.set(hashToken(adminToken), { id: group.id ?? `grp-${hashToken(adminToken).slice(0, 8)}`, ...group });
}

const stubGroupRepository: GroupRepository = {
  createOrRotateAdminToken: async () => { throw new Error("not implemented"); },
  findByInvite: async () => null,
  findAdminByHash: async (hash: string) => {
    initStore();
    const g = store.get(hash);
    if (!g) return null;
    return { groupId: g.id, adminTokenHash: hash };
  },
  getAdminView: async (admin: AdminScope) => {
    initStore();
    const g = store.get(admin.adminTokenHash);
    if (!g) return err({ code: "INVALID_LINK" });
    const active = g.participants.filter((p) => !p.removedAt);
    return ok({
      group: g.details,
      inviteUrl: `/g/${g.inviteToken}`,
      draw: g.draw,
      participantCount: active.length,
      participants: active.map(({ id, displayName, joinedAt }) => ({ id, displayName, joinedAt })),
    });
  },
  removeParticipant: async (admin: AdminScope, participantId: ParticipantId) => {
    initStore();
    const g = store.get(admin.adminTokenHash);
    if (!g) return err({ code: "INVALID_LINK" });
    if (g.draw.status !== "open") return err({ code: "GROUP_CLOSED" });
    const p = g.participants.find((item) => item.id === participantId && !item.removedAt);
    if (!p) return err({ code: "PARTICIPANT_NOT_FOUND" });
    p.removedAt = new Date().toISOString();
    return ok({ participantCount: g.participants.filter((item) => !item.removedAt).length });
  },
};

const appUrl = process.env.APP_URL ?? "https://amigo-secreto-app-five.vercel.app";

export async function getAdminViewUseCase(adminToken: string): Promise<Result<AdminGroup, DomainError>> {
  return getAdminView({ adminToken }, { groups: stubGroupRepository, tokens: localTokenService, appUrl });
}

export async function removeParticipantUseCase(adminToken: string, participantId: string): Promise<Result<{ participantCount: number }, DomainError>> {
  return removeParticipant({ adminToken, participantId }, { groups: stubGroupRepository, tokens: localTokenService });
}
