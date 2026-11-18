import "server-only";
import { after } from "next/server";
import { logger } from "../observability/logger";
import type { ServerSupabaseClient } from "../supabase/client";
import { sendGroupPush } from "./expo-push";

/** Schedules delivery after the response and keeps notification failures outside the draw result. */
export function scheduleDrawPush(client: ServerSupabaseClient, groupId: string): void {
  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  if (!accessToken) return;
  try {
    after(async () => {
      try {
        await sendGroupPush(client, groupId, "draw_done", accessToken);
      } catch {
        logger.error("Draw push delivery failed");
      }
    });
  } catch {
    logger.error("Draw push scheduling failed");
  }
}
