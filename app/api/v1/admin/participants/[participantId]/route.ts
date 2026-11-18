import { copy } from "@/app/_lib/copy";
import { removeParticipant } from "@/src/application/remove-participant";
import { buildAdminDeps } from "@/src/infrastructure/supabase/deps";
import { apiJson, apiOptions, apiRoute } from "../../../_lib/http";
import { domainApiError } from "../../../_lib/domain-error";

export const OPTIONS = apiOptions;

export const DELETE = apiRoute(
  { auth: "adminToken", operation: "v1.admin.participants.delete" },
  async (
    _request,
    { adminToken },
    { params }: { params: Promise<{ participantId: string }> }
  ) => {
    const { participantId } = await params;
    const result = await removeParticipant({ adminToken, participantId }, buildAdminDeps());
    if (!result.ok) {
      if (result.error.code === "INVALID_LINK") {
        return domainApiError("INVALID_LINK", copy.ADM_16.text);
      }
      if (result.error.code === "GROUP_CLOSED") {
        return domainApiError("GROUP_CLOSED", copy.ADM_11);
      }
      return domainApiError(result.error.code);
    }
    return apiJson({ participantCount: result.value.participantCount }, 200);
  }
);
