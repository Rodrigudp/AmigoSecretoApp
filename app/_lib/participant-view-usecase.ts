import type { DomainError } from "@/src/domain/errors";
import type {
  GroupId,
  ParticipantRepository,
  ParticipantView,
  TokenService,
} from "@/src/application/ports";
import { getParticipantView } from "@/src/application/get-participant-view";
import type { GetParticipantViewOutput } from "@/src/application/get-participant-view";
import { err, ok, type Result } from "@/src/shared/result";

// TODO(BE-01/DB-04): replace this in-memory stub with the real Supabase
// ParticipantRepository adapter. It persists nothing and resets on each deploy;
// it exists only so the participant area renders before the database adapter
// lands (CONTRATOS.md, same pattern as the create-group stub).

const CANNED_GROUP_ID: GroupId = "00000000-0000-4000-8000-000000000001";
const CANNED_EXPIRES_AT = "2027-01-16T23:59:59.999Z";

const stubTokens: TokenService = {
  generate: () => "stub-token",
  hash: (token) => `hash(${token})`,
};

const stubParticipantRepository: ParticipantRepository = {
  join: async () => err({ code: "INVALID_LINK" }),
  findActiveByHash: async (hash) =>
    // Any well-formed stub token resolves to the canned participant.
    hash.startsWith("hash(")
      ? {
          participantId: "stub-participant",
          accessTokenHash: hash,
          groupId: CANNED_GROUP_ID,
          displayName: "Ana",
          expiresAt: CANNED_EXPIRES_AT,
        }
      : null,
  getView: async () =>
    ok({
      displayName: "Ana",
      group: {
        name: "Família",
        maxValueCents: 5000,
        exchangeDate: "2026-12-20",
        location: null,
        status: "open",
      } satisfies ParticipantView["group"],
      // RN03: only the owner's own (empty) list is ever returned.
      ownWishItems: [],
    }),
};

/**
 * Resolves the participant area from a personal access token through the real
 * use case over the stub repository.
 */
export async function resolveParticipantByToken(
  accessToken: string
): Promise<Result<GetParticipantViewOutput, DomainError>> {
  return getParticipantView(
    { accessToken },
    { participants: stubParticipantRepository, tokens: stubTokens }
  );
}

export function cookieNameFor(groupId: GroupId): string {
  return `ptk_${groupId}`;
}
