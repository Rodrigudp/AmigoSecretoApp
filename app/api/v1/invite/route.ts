import { getInviteViewUseCase } from "@/app/_lib/participant-stubs";
import { apiOptions, apiRoute, capabilityToken } from "../_lib/http";
import { fromResult } from "../_lib/domain-error";

export { apiOptions as OPTIONS };

export const GET = apiRoute(
  { auth: "inviteToken", operation: "read_invite" },
  async (request, auth) =>
    fromResult(
      await getInviteViewUseCase({
        ...auth,
        resumeAccessToken: capabilityToken(request.headers.get("x-resume-participant-token")),
        recordOpened: true,
      })
    )
);
