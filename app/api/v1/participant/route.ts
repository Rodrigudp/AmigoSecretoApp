import { resolveParticipantByToken } from "@/app/_lib/participant-view-usecase";
import { apiJson, apiOptions, apiRoute, fromResult } from "../_lib/http";
import { originalGiftUrl } from "../_lib/gift-url";

export { apiOptions as OPTIONS };

export const GET = apiRoute(
  { auth: "accessToken", operation: "read_participant" },
  async (_, auth) => {
    const result = await resolveParticipantByToken(auth.accessToken);
    if (!result.ok) return fromResult(result);
    const { groupId, expiresAt, view } = result.value;
    return apiJson({
      groupId,
      expiresAt,
      view: {
        displayName: view.displayName,
        group: view.group,
        ownWishItems: view.ownWishItems.map(({ id, title, url, note }) => ({
          id,
          title,
          url: originalGiftUrl(url),
          note,
        })),
      },
    });
  }
);
