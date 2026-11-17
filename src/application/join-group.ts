import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type {
  EventRepository,
  GroupRepository,
  GroupId,
  ParticipantRepository,
  TokenService,
} from "./ports";
import { joinGroupInputSchema, type JoinGroupInput } from "./schemas/join-group";

export type JoinGroupOutput = {
  displayName: string;
  personalUrl: string;
  /** Group id for the presentation layer to address the `ptk_<groupId>` cookie (PAR-01). */
  groupId: GroupId;
  /** Group expiration (exchange date + 60 days, RN08) used as cookie expiry. */
  expiresAt: string;
};

export type JoinGroupDeps = {
  groups: GroupRepository;
  participants: ParticipantRepository;
  tokens: TokenService;
  events: EventRepository;
  appUrl: string;
};

/**
 * RF03: a person joins a group through its invite link, giving only their name.
 * RN04 (closed after draw), RN07 (duplicate suffix) and RN09 (limit 100) are
 * enforced by the repository; this use case validates the input, resolves the
 * invite, stores the participant and builds the one-time personal link (RF04).
 */
export async function joinGroup(
  input: JoinGroupInput,
  deps: JoinGroupDeps
): Promise<Result<JoinGroupOutput, DomainError>> {
  const parsed = joinGroupInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const found = await deps.groups.findByInvite(parsed.data.inviteToken);
  if (!found) {
    // Generic refusal: an unknown token must not reveal whether a group exists (ADR-002).
    return err({ code: "INVALID_LINK" });
  }

  if (found.view.status !== "open") {
    return err({ code: "GROUP_CLOSED" });
  }

  const personalToken = deps.tokens.generate();
  const joined = await deps.participants.join({
    inviteToken: parsed.data.inviteToken,
    displayName: parsed.data.displayName,
    accessTokenHash: deps.tokens.hash(personalToken),
  });
  if (!joined.ok) {
    return err(joined.error);
  }

  // Metrics only (no personal data); never blocks or fails the join itself.
  try {
    await deps.events.append({ groupId: joined.value.groupId, type: "participant_joined" });
  } catch {
    // Event persistence failure is logged by the adapter, not surfaced here.
  }

  return ok({
    displayName: joined.value.displayName,
    personalUrl: `${deps.appUrl}/p/${personalToken}`,
    groupId: joined.value.groupId,
    expiresAt: joined.value.expiresAt,
  });
}
