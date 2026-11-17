import type { DomainError } from "./errors";
import { err, ok, type Result } from "../shared/result";

export type ParticipantId = string;
export type Pair = { giverId: ParticipantId; receiverId: ParticipantId };

/** The injected RNG returns an integer from 0 (inclusive) to maxExclusive (exclusive). */
export function drawPairs(
  ids: readonly ParticipantId[],
  rng: (maxExclusive: number) => number
): Result<Pair[], DomainError> {
  if (ids.length < 3) {
    return err({ code: "NOT_ENOUGH_PARTICIPANTS" });
  }

  if (new Set(ids).size !== ids.length) {
    return err({ code: "INVALID_INPUT" });
  }

  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = rng(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  const pairs = shuffled.map((giverId, index) => ({
    giverId,
    receiverId: shuffled[(index + 1) % shuffled.length],
  }));

  return ok(pairs);
}
