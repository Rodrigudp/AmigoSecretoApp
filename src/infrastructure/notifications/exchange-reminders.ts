import "server-only";
import { getTodayInSaoPaulo } from "@/src/application/create-group";
import { logger } from "../observability/logger";
import type { ServerSupabaseClient } from "../supabase/client";
import { sendGroupPush } from "./expo-push";

const pageSize = 100;

export async function sendExchangeReminders(
  client: ServerSupabaseClient,
  accessToken: string,
  now = new Date()
) {
  const reminderDate = getTodayInSaoPaulo(now);
  const target = new Date(reminderDate + "T00:00:00Z");
  target.setUTCDate(target.getUTCDate() + 2);
  const exchangeDate = target.toISOString().slice(0, 10);
  let claimed = 0;
  let failed = 0;
  let lastId: string | undefined;

  for (;;) {
    const groups = await readPage(client, exchangeDate, now.toISOString(), lastId);
    for (const group of groups) {
      try {
        if (!(await claimReminder(client, group.id, reminderDate))) continue;
        claimed++;
        await sendGroupPush(client, group.id, "exchange_reminder", accessToken);
      } catch {
        failed++;
        logger.error("Group exchange reminder failed");
      }
    }
    lastId = groups.at(-1)?.id;
    if (groups.length < pageSize) return { claimed, failed };
  }
}

async function readPage(
  client: ServerSupabaseClient,
  exchangeDate: string,
  now: string,
  lastId: string | undefined
) {
  const query = client
    .from("groups")
    .select("id")
    .eq("exchange_date", exchangeDate)
    .gt("expires_at", now)
    .order("id")
    .limit(pageSize);
  const { data, error } = await (lastId ? query.gt("id", lastId) : query);
  if (error) throw new Error("Failed to read reminder groups");
  return data;
}

async function claimReminder(client: ServerSupabaseClient, groupId: string, reminderDate: string) {
  const { data, error } = await client
    .from("push_reminders_sent")
    .upsert(
      { group_id: groupId, reminder_date: reminderDate },
      {
        onConflict: "group_id,reminder_date",
        ignoreDuplicates: true,
      }
    )
    .select("group_id")
    .maybeSingle();
  if (error) throw new Error("Failed to reserve reminder");
  return data !== null;
}
