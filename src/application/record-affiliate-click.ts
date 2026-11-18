import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type { EventRepository, WishItemId, WishItemRepository } from "./ports";
import { isAllowedRedirectUrl } from "./resolve-product-link";

export type RecordAffiliateClickInput = {
  itemId: WishItemId;
};

export type RecordAffiliateClickOutput = {
  recorded: boolean;
};

export type RecordAffiliateClickDeps = {
  wishItems: Pick<WishItemRepository, "getVisibleLink">;
  events: Pick<EventRepository, "append">;
};

/**
 * Caso de uso: Registra clique em link de afiliado.
 * RF10 / LST-03:
 * - Valida se o item existe e possui link seguro de afiliado.
 * - Grava evento 'affiliate_click' com apenas { groupId, type: 'affiliate_click' } (RNF05, sem dados pessoais).
 */
export async function recordAffiliateClick(
  input: RecordAffiliateClickInput,
  deps: RecordAffiliateClickDeps,
  access?: Parameters<WishItemRepository["getVisibleLink"]>[0]
): Promise<Result<RecordAffiliateClickOutput, DomainError>> {
  const scope = access ?? { participantId: "", accessTokenHash: "" };
  const itemRes = await deps.wishItems.getVisibleLink(scope, input.itemId);
  if (!itemRes.ok) {
    return err(itemRes.error);
  }

  const { groupId, affiliateUrl, url } = itemRes.value;
  const destination = affiliateUrl ?? url;

  if (!destination || !isAllowedRedirectUrl(destination)) {
    return err({ code: "PRODUCT_LINK_UNAVAILABLE" });
  }

  // Se o item tem affiliateUrl, grava o evento
  if (affiliateUrl) {
    await deps.events.append({
      groupId,
      type: "affiliate_click",
    });
    return ok({ recorded: true });
  }

  return ok({ recorded: false });
}
