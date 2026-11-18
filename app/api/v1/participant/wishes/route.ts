import { addWishItem } from "@/src/application/add-wish-item";
import { listWishItems } from "@/src/application/list-wish-items";
import { apiJson, apiOptions, apiRoute } from "../../_lib/http";
import { buildWishDeps, parseWishBody, toMobileWishItem, wishError } from "./_shared";

export { apiOptions as OPTIONS };

export const GET = apiRoute(
  { auth: "accessToken", operation: "list_wishes" },
  async (_request, credential) => {
    const result = await listWishItems(credential, await buildWishDeps());
    if (!result.ok) return wishError(result.error.code);
    return apiJson({ items: result.value.map(toMobileWishItem) });
  }
);

export const POST = apiRoute(
  { auth: "accessToken", operation: "add_wish", policy: "api_v1_write" },
  async (request, credential) => {
    const fields = await parseWishBody(request);
    if (!fields.success) return wishError("INVALID_INPUT");

    const result = await addWishItem({ ...fields.data, ...credential }, await buildWishDeps());
    if (!result.ok) return wishError(result.error.code);
    return apiJson({ item: toMobileWishItem(result.value.item) }, 201);
  }
);
