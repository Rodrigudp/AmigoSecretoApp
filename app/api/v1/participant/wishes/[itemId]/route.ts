import { removeWishItem } from "@/src/application/remove-wish-item";
import { removeWishItemInputSchema } from "@/src/application/schemas/wish-item";
import { updateWishItem } from "@/src/application/update-wish-item";
import { apiJson, apiOptions, apiRoute } from "../../../_lib/http";
import { buildWishDeps, parseWishBody, toMobileWishItem, wishError } from "../_shared";

type ItemRouteContext = { params: Promise<{ itemId: string }> };

export { apiOptions as OPTIONS };

export const PATCH = apiRoute(
  { auth: "accessToken", operation: "update_wish", policy: "api_v1_write" },
  async (request, credential, { params }: ItemRouteContext) => {
    const input = removeWishItemInputSchema.safeParse({ ...(await params), ...credential });
    if (!input.success) return wishError("INVALID_INPUT");

    const fields = await parseWishBody(request);
    if (!fields.success) return wishError("INVALID_INPUT");

    const result = await updateWishItem({ ...fields.data, ...input.data }, await buildWishDeps());
    if (!result.ok) return wishError(result.error.code);
    return apiJson({ item: toMobileWishItem(result.value.item) });
  }
);

export const DELETE = apiRoute(
  { auth: "accessToken", operation: "delete_wish", policy: "api_v1_write" },
  async (_request, credential, { params }: ItemRouteContext) => {
    const input = removeWishItemInputSchema.safeParse({ ...(await params), ...credential });
    if (!input.success) return wishError("INVALID_INPUT");

    const result = await removeWishItem(input.data, await buildWishDeps());
    if (!result.ok) return wishError(result.error.code);
    return apiJson({ id: result.value.id });
  }
);
