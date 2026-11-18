import { copy } from "@/app/_lib/copy";
import { getAdminView } from "@/src/application/get-admin-view";
import { buildAdminDeps } from "@/src/infrastructure/supabase/deps";
import { apiJson, apiOptions, apiRoute } from "../_lib/http";
import { domainApiError } from "../_lib/domain-error";

export const OPTIONS = apiOptions;

export const GET = apiRoute(
  { auth: "adminToken", operation: "v1.admin.get" },
  async (_request, { adminToken }) => {
    const result = await getAdminView({ adminToken }, buildAdminDeps());
    if (!result.ok) {
      const message = result.error.code === "INVALID_LINK" ? copy.ADM_16.text : undefined;
      return domainApiError(result.error.code, message);
    }
    return apiJson(result.value, 200);
  }
);
