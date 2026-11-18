import { apiError, apiJson } from "@/app/api/v1/_lib/http";
import { sendExchangeReminders } from "@/src/infrastructure/notifications/exchange-reminders";
import { logger } from "@/src/infrastructure/observability/logger";
import { createServerClient } from "@/src/infrastructure/supabase/client";
import { tokenService } from "@/src/infrastructure/tokens";

function authorized(request: Request): boolean {
  const secret = process.env.PUSH_CRON_SECRET;
  const raw = /^Bearer ([^\s,]+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  return Boolean(
    secret && secret.length >= 32 && raw && tokenService.verify(raw, tokenService.hash(secret))
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!authorized(request)) return apiError("INVALID_LINK");
  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  if (!accessToken) return apiError("INTERNAL_ERROR");
  try {
    const result = await sendExchangeReminders(createServerClient(), accessToken);
    return result.failed > 0 ? apiError("INTERNAL_ERROR") : apiJson(result);
  } catch {
    logger.error("Exchange reminder job failed");
    return apiError("INTERNAL_ERROR");
  }
}
