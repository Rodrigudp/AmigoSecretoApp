import { getMyResult } from "@/src/application/get-my-result";
import type { RevealedWishItem } from "@/src/application/ports";
import { buildGetMyResultDeps } from "@/src/infrastructure/supabase/deps";
import { apiJson, apiOptions, apiRoute } from "../../_lib/http";
import { domainApiError } from "../../_lib/domain-error";

type MobileWishItem = {
  id: string;
  title: string;
  url: string | null;
  note: string | null;
};

function toMobileWishItem(item: RevealedWishItem): MobileWishItem {
  const fallbackUrl =
    item.productLink && !item.productLink.affiliate ? item.productLink.href : null;
  return {
    id: item.id,
    title: item.title,
    url: item.url ?? fallbackUrl,
    note: item.note,
  };
}

export const OPTIONS = apiOptions;

export const POST = apiRoute(
  { auth: "accessToken", operation: "v1.participant.reveal" },
  async (_request, { accessToken }) => {
    const result = await getMyResult(
      { accessToken, includeOriginalUrl: true },
      buildGetMyResultDeps()
    );
    if (!result.ok) {
      return domainApiError(result.error.code);
    }

    return apiJson(
      {
        drawVersion: result.value.drawVersion,
        recipientName: result.value.recipientName,
        wishItems: result.value.wishItems.map(toMobileWishItem),
      },
      200
    );
  }
);
