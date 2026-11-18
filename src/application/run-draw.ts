import { drawPairs } from "../domain/draw";
import type { DomainError } from "../domain/errors";
import { err, ok, type Result } from "../shared/result";
import type {
  AdminScope,
  DrawReceipt,
  DrawRepository,
  GroupRepository,
  TokenService,
} from "./ports";
import { runDrawInputSchema, type RunDrawInput } from "./schemas/admin";

export type { RunDrawInput };

export type RunDrawDeps = {
  groups: Pick<GroupRepository, "findAdminByHash">;
  draws: DrawRepository;
  tokens: TokenService;
  rng: (maxExclusive: number) => number;
  /** Optional post-draw hook (used by PR C to trigger "Sorteio feito" push notifications). */
  onDrawCompleted?: (event: { groupId: string }) => Promise<void> | void;
};

const MAX_DRAW_ATTEMPTS = 3;

type AttemptOutcome = { receipt: DrawReceipt; transitioned: boolean };

async function attemptFirstDraw(
  adminScope: AdminScope,
  expectedParticipantCount: number | undefined,
  deps: Pick<RunDrawDeps, "draws" | "rng">
): Promise<Result<AttemptOutcome, DomainError>> {
  const stateResult = await deps.draws.readForFirstDraw(adminScope);
  if (!stateResult.ok) return stateResult;
  if (stateResult.value.status === "drawn") {
    return ok({ receipt: stateResult.value, transitioned: false });
  }

  const { participantIds } = stateResult.value;
  const pairsResult = drawPairs(participantIds, deps.rng);
  if (!pairsResult.ok) return pairsResult;

  if (
    expectedParticipantCount !== undefined &&
    participantIds.length !== expectedParticipantCount
  ) {
    return err({ code: "DRAW_MEMBERS_CHANGED" });
  }

  const committed = await deps.draws.commitFirstDraw(adminScope, participantIds, pairsResult.value);
  if (!committed.ok) return committed;
  return ok({ receipt: committed.value, transitioned: true });
}

/**
 * RF08, RN01-RN04, HU04: Organizer performs the group draw (SRT-03).
 * Never returns pairs in its output (RN03).
 */
export async function runDraw(
  input: unknown,
  deps: RunDrawDeps
): Promise<Result<DrawReceipt, DomainError>> {
  const parsed = runDrawInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const adminTokenHash = deps.tokens.hash(parsed.data.adminToken);
  const adminScope = await deps.groups.findAdminByHash(adminTokenHash);
  if (!adminScope) {
    return err({ code: "INVALID_LINK" });
  }

  let lastResult: Result<AttemptOutcome, DomainError> = err({ code: "DRAW_MEMBERS_CHANGED" });
  for (let attempt = 0; attempt < MAX_DRAW_ATTEMPTS; attempt++) {
    lastResult = await attemptFirstDraw(adminScope, parsed.data.expectedParticipantCount, deps);
    if (lastResult.ok) {
      if (lastResult.value.transitioned && deps.onDrawCompleted) {
        try {
          await deps.onDrawCompleted({ groupId: adminScope.groupId });
        } catch {
          // Push notification failures must never block or revert a completed draw.
        }
      }
      return ok(lastResult.value.receipt);
    }
    if (lastResult.error.code !== "DRAW_MEMBERS_CHANGED") {
      return lastResult;
    }
    if (parsed.data.expectedParticipantCount !== undefined) {
      return lastResult;
    }
  }
  return lastResult;
}
