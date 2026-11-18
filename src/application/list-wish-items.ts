import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type {
  AccessScope,
  ParticipantRepository,
  TokenService,
  WishItem,
  WishItemRepository,
} from "./ports";
import { listWishItemsInputSchema, type ListWishItemsInput } from "./schemas/wish-item";

export type ListWishItemsDeps = {
  participants: ParticipantRepository;
  wishItems: WishItemRepository;
  tokens: TokenService;
};

/**
 * RF05: Lista os itens de desejo do participante autenticado.
 * - Valida input com schema Zod (accessToken)
 * - Autentica o participante pelo hash do accessToken
 * - Chama WishItemRepository.listOwn (retorna do mais recente para o mais antigo)
 */
export async function listWishItems(
  input: ListWishItemsInput,
  deps: ListWishItemsDeps
): Promise<Result<WishItem[], DomainError>> {
  const parsed = listWishItemsInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const { accessToken } = parsed.data;

  const tokenHash = deps.tokens.hash(accessToken);
  const active = await deps.participants.findActiveByHash(tokenHash);
  if (!active) {
    return err({ code: "INVALID_LINK" });
  }

  const access: AccessScope = {
    participantId: active.participantId,
    accessTokenHash: active.accessTokenHash,
  };

  const items = await deps.wishItems.listOwn(access);
  if (!items.ok) {
    return err(items.error);
  }

  return ok(items.value);
}
