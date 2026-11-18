import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type {
  AccessScope,
  ParticipantRepository,
  TokenService,
  WishItemId,
  WishItemRepository,
} from "./ports";
import { removeWishItemInputSchema, type RemoveWishItemInput } from "./schemas/wish-item";

export type RemoveWishItemDeps = {
  participants: ParticipantRepository;
  wishItems: WishItemRepository;
  tokens: TokenService;
};

/**
 * RF05: Remove um item da lista de desejos (exclusão física, RN-LST-10).
 * - Valida input com schema Zod (itemId UUID, accessToken)
 * - Autentica o participante pelo hash do accessToken
 * - Chama WishItemRepository.deleteOwn (revalida ownership)
 */
export async function removeWishItem(
  input: RemoveWishItemInput,
  deps: RemoveWishItemDeps
): Promise<Result<{ id: WishItemId }, DomainError>> {
  const parsed = removeWishItemInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const { accessToken, itemId } = parsed.data;

  const tokenHash = deps.tokens.hash(accessToken);
  const active = await deps.participants.findActiveByHash(tokenHash);
  if (!active) {
    return err({ code: "INVALID_LINK" });
  }

  const access: AccessScope = {
    participantId: active.participantId,
    accessTokenHash: active.accessTokenHash,
  };

  const deleted = await deps.wishItems.deleteOwn(access, itemId);
  if (!deleted.ok) {
    return err(deleted.error);
  }

  return ok({ id: deleted.value.id });
}
