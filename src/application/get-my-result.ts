import { z } from "zod";
import type { DomainError } from "../domain/errors";
import { err, type Result } from "../shared/result";
import type {
  DrawRepository,
  EventRepository,
  ParticipantRepository,
  RevealedResult,
  TokenService,
} from "./ports";

export const getMyResultInputSchema = z.object({
  accessToken: z.string().trim().min(1, "INVALID_LINK").max(200),
  expectedGroupId: z.string().trim().min(1, "INVALID_LINK").max(100).optional(),
  includeOriginalUrl: z.boolean().optional(),
});

export type GetMyResultInput = z.infer<typeof getMyResultInputSchema>;

export type GetMyResultDeps = {
  participants: Pick<ParticipantRepository, "findActiveByHash">;
  draws: Pick<DrawRepository, "getCurrentResult">;
  tokens: Pick<TokenService, "hash">;
  events?: Pick<EventRepository, "append">;
};

/**
 * RF09, RN02, RN03, HU05: Participant reveals their own Secret Santa result (SRT-04).
 */
export async function getMyResult(
  input: unknown,
  deps: GetMyResultDeps
): Promise<Result<RevealedResult, DomainError>> {
  const parsed = getMyResultInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const accessTokenHash = deps.tokens.hash(parsed.data.accessToken);
  const active = await deps.participants.findActiveByHash(accessTokenHash);
  if (!active) {
    return err({ code: "INVALID_LINK" });
  }
  if (parsed.data.expectedGroupId && active.groupId !== parsed.data.expectedGroupId) {
    return err({ code: "INVALID_LINK" });
  }

  const accessScope = {
    participantId: active.participantId,
    accessTokenHash: active.accessTokenHash,
  };
  const result = parsed.data.includeOriginalUrl
    ? await deps.draws.getCurrentResult(accessScope, { includeOriginalUrl: true })
    : await deps.draws.getCurrentResult(accessScope);
  if (!result.ok) {
    return result;
  }

  if (deps.events) {
    try {
      await deps.events.append({ groupId: active.groupId, type: "result_revealed" });
    } catch {
      // Telemetry failures must never block revealing the participant's result.
    }
  }

  return result;
}
