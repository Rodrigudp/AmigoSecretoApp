import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type { GroupId, WishItemId, WishItemRepository } from "./ports";

export type ResolveProductLinkInput = {
  itemId: WishItemId;
};

export type ResolveProductLinkOutput = {
  groupId: GroupId;
  destinationUrl: string;
  isAffiliate: boolean;
};

export type ResolveProductLinkDeps = {
  wishItems: Pick<WishItemRepository, "getLinkForRedirect">;
};

const ALLOWED_AFFILIATE_HOSTS = [
  "amazon.com.br",
  "www.amazon.com.br",
  "mercadolivre.com.br",
  "www.mercadolivre.com.br",
  "produto.mercadolivre.com.br",
];

/**
 * Valida se uma URL é segura para redirecionamento.
 * Exige HTTPS estrito e host na allowlist de lojas parceiras.
 */
export function isAllowedRedirectUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_AFFILIATE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

/**
 * Caso de uso: Resolve a URL de destino de um item de presente para o redirect /r/[itemId].
 * - Busca o item existente no banco.
 * - Garante que o destino vem do banco e passa na allowlist de lojas parceiras (AM-05).
 */
export async function resolveProductLink(
  input: ResolveProductLinkInput,
  deps: ResolveProductLinkDeps
): Promise<Result<ResolveProductLinkOutput, DomainError>> {
  const res = await deps.wishItems.getLinkForRedirect(input.itemId);
  if (!res.ok) {
    return err(res.error);
  }

  const destinationUrl = res.value.affiliateUrl ?? res.value.url;
  if (!destinationUrl) {
    return err({ code: "PRODUCT_LINK_UNAVAILABLE" });
  }

  if (!isAllowedRedirectUrl(destinationUrl)) {
    return err({ code: "PRODUCT_LINK_UNAVAILABLE" });
  }

  return ok({
    groupId: res.value.groupId,
    destinationUrl,
    isAffiliate: Boolean(res.value.affiliateUrl),
  });
}
