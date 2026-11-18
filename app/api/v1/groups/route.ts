import { createGroupInputSchema } from "@/src/application/schemas/create-group";
import { createGroup } from "@/src/application/create-group";
import { buildCreateGroupDeps } from "@/src/infrastructure/supabase/deps";
import { apiError, apiJson, apiOptions, apiRoute, capabilityToken } from "../_lib/http";
import { fromResult } from "../_lib/domain-error";
import { readJson } from "../_lib/input";

export { apiOptions as OPTIONS };

export const POST = apiRoute(
  { auth: "none", operation: "create_group", policy: "create_group" },
  async (request) => {
    const parsed = createGroupInputSchema.strict().safeParse(await readJson(request));
    if (!parsed.success) return apiError("INVALID_INPUT");
    const result = await createGroup(parsed.data, buildCreateGroupDeps());
    if (!result.ok) return fromResult(result);
    const { inviteUrl, adminUrl } = result.value;
    const inviteToken = capabilityToken(new URL(inviteUrl).pathname.split("/").at(-1) ?? null);
    const adminToken = capabilityToken(new URL(adminUrl).pathname.split("/").at(-1) ?? null);
    if (!inviteToken || !adminToken) return apiError("INTERNAL_ERROR");
    return apiJson({ inviteUrl, adminUrl, inviteToken, adminToken }, 201);
  }
);
