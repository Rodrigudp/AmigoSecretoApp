import { createServerClient } from "@/src/infrastructure/supabase/client";
import { resolveMobileGroup } from "@/src/infrastructure/supabase/mobile-group-repository";
import { apiError, apiJson, apiOptions, apiRoute } from "../../_lib/http";

export { apiOptions as OPTIONS };

export const GET = apiRoute(
  { auth: "credentialToken", operation: "group_summary" },
  async (_, { credentialToken }) => {
    const group = await resolveMobileGroup(createServerClient(), credentialToken);
    return group ? apiJson(group.summary) : apiError("INVALID_LINK");
  }
);
