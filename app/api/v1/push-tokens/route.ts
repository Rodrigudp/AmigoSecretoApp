import { createServerClient } from "@/src/infrastructure/supabase/client";
import { resolveMobileGroup } from "@/src/infrastructure/supabase/mobile-group-repository";
import { apiError, apiJson, apiOptions, apiRoute } from "../_lib/http";
import { pushTokenInput, readJson, registerPushTokenInput } from "../_lib/input";

export { apiOptions as OPTIONS };

const route = { auth: "credentialToken", policy: "api_v1_write" } as const;

export const POST = apiRoute(
  { ...route, operation: "register_push_token" },
  async (request, auth) => {
    const parsed = registerPushTokenInput.safeParse(await readJson(request));
    if (!parsed.success) return apiError("INVALID_INPUT");
    const client = createServerClient();
    const group = await resolveMobileGroup(client, auth.credentialToken);
    if (!group) return apiError("INVALID_LINK");

    const { error, data } = await client.rpc("register_push_token", {
      p_group_id: group.summary.groupId,
      p_role: group.summary.role,
      p_credential_hash: group.credentialHash,
      p_platform: parsed.data.platform,
      p_expo_push_token: parsed.data.expoPushToken,
    });
    if (error?.message === "INVALID_LINK") return apiError("INVALID_LINK");
    if (error || data !== true) throw new Error("Push registration failed");
    return apiJson({ registered: true, role: group.summary.role });
  }
);

export const DELETE = apiRoute(
  { ...route, operation: "remove_push_token" },
  async (request, auth) => {
    const parsed = pushTokenInput.safeParse(await readJson(request));
    if (!parsed.success) return apiError("INVALID_INPUT");
    const client = createServerClient();
    const group = await resolveMobileGroup(client, auth.credentialToken);
    if (!group) return apiError("INVALID_LINK");
    const { error } = await client.rpc("unregister_push_tokens", {
      p_credential_hash: group.credentialHash,
      p_expo_push_token: parsed.data.expoPushToken,
    });
    if (error) throw new Error("Push removal failed");
    return apiJson({ removed: true, role: group.summary.role });
  }
);
