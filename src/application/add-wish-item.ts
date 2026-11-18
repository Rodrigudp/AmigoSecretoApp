import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type {
  AccessScope,
  AffiliateLinkService,
  ParticipantRepository,
  SaveWishItemOutput,
  StoredWishFields,
  TokenService,
  WishItemRepository,
} from "./ports";
import { addWishItemInputSchema, normalizeUrl, type AddWishItemInput } from "./schemas/wish-item";

export type AddWishItemDeps = {
  participants: ParticipantRepository;
  wishItems: WishItemRepository;
  tokens: TokenService;
  affiliate?: AffiliateLinkService;
};

/**
 * RF05 / RF10: Adiciona um item à lista de desejos do participante.
 * - Valida input com schema Zod (título 1-120, url https <= 2048, nota <= 500)
 * - Autentica o participante pelo hash do accessToken
 * - Normaliza a URL de produto
 * - Tenta converter em link de afiliado se affiliate service fornecido
 * - Chama WishItemRepository.addOwn (limite de 20 itens tratado no repositório)
 */
export async function addWishItem(
  input: AddWishItemInput,
  deps: AddWishItemDeps
): Promise<Result<SaveWishItemOutput, DomainError>> {
  const parsed = addWishItemInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const { accessToken, title, url, note } = parsed.data;

  const tokenHash = deps.tokens.hash(accessToken);
  const active = await deps.participants.findActiveByHash(tokenHash);
  if (!active) {
    return err({ code: "INVALID_LINK" });
  }

  const access: AccessScope = {
    participantId: active.participantId,
    accessTokenHash: active.accessTokenHash,
  };

  let cleanUrl: string | null = null;
  let affiliateUrl: string | null = null;
  let store: StoredWishFields["store"] = null;
  let warning: SaveWishItemOutput["warning"] = null;

  if (url) {
    const norm = normalizeUrl(url);
    if (!norm.ok) {
      return err({ code: "INVALID_INPUT" });
    }
    cleanUrl = norm.url;

    if (deps.affiliate) {
      try {
        const converted = await deps.affiliate.convert(cleanUrl);
        if (converted) {
          affiliateUrl = converted.affiliateUrl;
          store = converted.store;
        } else {
          warning = "AFFILIATE_UNAVAILABLE";
        }
      } catch {
        warning = "AFFILIATE_UNAVAILABLE";
      }
    }
  }

  const storedFields: StoredWishFields = {
    title,
    url: cleanUrl,
    affiliateUrl,
    note: note ?? null,
    store,
  };

  const added = await deps.wishItems.addOwn(access, storedFields);
  if (!added.ok) {
    return err(added.error);
  }

  return ok({
    item: added.value,
    warning,
  });
}
