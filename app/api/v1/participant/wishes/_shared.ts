import { copy } from "@/app/_lib/copy";
import type { WishItem } from "@/src/application/ports";
import { wishFieldsSchema } from "@/src/application/schemas/wish-item";
import type { DomainErrorCode } from "@/src/domain/errors";
import { apiError } from "../../_lib/http";

const bodySchema = wishFieldsSchema.strict();

export async function parseWishBody(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  return bodySchema.safeParse(body);
}

export async function buildWishDeps() {
  const { buildParticipantViewDeps, buildWishItemRepository } =
    await import("@/src/infrastructure/supabase/deps");
  return { ...buildParticipantViewDeps(), wishItems: buildWishItemRepository() };
}

export function toMobileWishItem({ id, title, url, note }: WishItem) {
  return { id, title, url: withoutAmazonTag(url), note };
}

function withoutAmazonTag(url: string | null): string | null {
  const parsed = url && URL.parse(url);
  if (!parsed || parsed.hostname.replace(/\.$/, "").replace(/^www\./, "") !== "amazon.com.br") {
    return url;
  }
  if (!parsed.searchParams.has("tag")) return url;
  parsed.searchParams.delete("tag");
  return parsed.href;
}

export function wishError(code: DomainErrorCode): Response {
  switch (code) {
    case "INVALID_INPUT":
      return apiError(code, copy.WSH_22.saveError);
    case "INVALID_LINK":
    case "WISH_ITEM_NOT_FOUND":
    case "WISH_LIST_FULL":
      return apiError(code);
    default:
      return apiError("INTERNAL_ERROR");
  }
}
