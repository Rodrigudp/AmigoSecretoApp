import { copy } from "@/app/_lib/copy";
import { runDraw } from "@/src/application/run-draw";
import { buildAdminDeps } from "@/src/infrastructure/supabase/deps";
import { apiError, apiJson, apiOptions, apiRoute } from "../../_lib/http";
import { domainApiError } from "../../_lib/domain-error";

export const OPTIONS = apiOptions;

async function parseOptionalDrawBody(
  request: Request
): Promise<{ ok: true; expectedParticipantCount?: unknown } | { ok: false }> {
  const raw = await request.text();
  if (!raw.trim()) {
    return { ok: true };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ok: false };
    }
    return {
      ok: true,
      expectedParticipantCount: (parsed as Record<string, unknown>).expectedParticipantCount,
    };
  } catch {
    return { ok: false };
  }
}

export const POST = apiRoute(
  { auth: "adminToken", operation: "v1.admin.draw", policy: "run_draw" },
  async (request, { adminToken }) => {
    const body = await parseOptionalDrawBody(request);
    if (!body.ok) {
      return apiError("INVALID_INPUT");
    }

    const input =
      body.expectedParticipantCount !== undefined
        ? { adminToken, expectedParticipantCount: body.expectedParticipantCount }
        : { adminToken };

    const result = await runDraw(input, buildAdminDeps());
    if (!result.ok) {
      const message = result.error.code === "INVALID_LINK" ? copy.ADM_16.text : undefined;
      return domainApiError(result.error.code, message);
    }
    return apiJson({ status: result.value.status, drawnAt: result.value.drawnAt }, 200);
  }
);
