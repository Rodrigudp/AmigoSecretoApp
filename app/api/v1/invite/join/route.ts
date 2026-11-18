import { copy } from "@/app/_lib/copy";
import { joinGroupUseCase } from "@/app/_lib/participant-stubs";
import { joinGroupInputSchema } from "@/src/application/schemas/join-group";
import { apiError, apiOptions, apiRoute, fromResult } from "../../_lib/http";
import { readJson } from "../../_lib/input";

export { apiOptions as OPTIONS };

const joinBody = joinGroupInputSchema.pick({ displayName: true }).strict();

export const POST = apiRoute(
  { auth: "inviteToken", operation: "join_group", policy: "join_group" },
  async (request, auth) => {
    const parsed = joinBody.safeParse(await readJson(request));
    if (!parsed.success) return apiError("INVALID_INPUT", copy.CNV_13);
    return fromResult(await joinGroupUseCase({ ...auth, ...parsed.data }), 201);
  }
);
