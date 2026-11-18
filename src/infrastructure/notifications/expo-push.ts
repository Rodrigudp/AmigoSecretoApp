import "server-only";
import { z } from "zod";
import { logger } from "../observability/logger";
import type { ServerSupabaseClient } from "../supabase/client";

type PushType = keyof typeof messages;
const messages = {
  draw_done: { title: "Sorteio feito!", body: "Abra o Papelzinho para ver quem você tirou." },
  exchange_reminder: { title: "Encontro de amigo secreto", body: "Faltam 2 dias para o encontro." },
} as const;

const expoUrl = "https://exp.host/--/api/v2/push/send";
const batchSize = 100;
const ticketResponse = z.object({
  data: z.array(
    z.object({
      status: z.enum(["ok", "error"]),
      details: z.object({ error: z.string().optional() }).optional(),
    })
  ),
});

export async function sendGroupPush(
  client: ServerSupabaseClient,
  groupId: string,
  type: PushType,
  accessToken: string
): Promise<void> {
  const query = client.from("push_tokens").select("expo_push_token").eq("group_id", groupId);
  const { data, error } = await (type === "draw_done" ? query.eq("role", "participant") : query);
  if (error) throw new Error("Failed to read push registrations");

  const tokens = [...new Set(data.map(({ expo_push_token }) => expo_push_token))];
  for (let offset = 0; offset < tokens.length; offset += batchSize) {
    await sendBatch(client, tokens.slice(offset, offset + batchSize), groupId, type, accessToken);
  }
}

async function sendBatch(
  client: ServerSupabaseClient,
  tokens: string[],
  groupId: string,
  type: PushType,
  accessToken: string
): Promise<void> {
  const attemptedAt = new Date().toISOString();
  const response = await fetch(expoUrl, {
    method: "POST",
    headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
    body: JSON.stringify(tokens.map((to) => ({ ...messages[type], to, data: { groupId, type } }))),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw new Error("Expo push request failed");
  const parsed = ticketResponse.safeParse(await response.json());
  if (!parsed.success || parsed.data.data.length !== tokens.length) {
    throw new Error("Invalid Expo ticket response");
  }
  const tickets = parsed.data.data;
  const invalid = tokens.filter((_, i) => tickets[i]?.details?.error === "DeviceNotRegistered");
  if (invalid.length > 0) {
    const { error } = await client
      .from("push_tokens")
      .delete()
      .in("expo_push_token", invalid)
      .lte("updated_at", attemptedAt);
    if (error) throw new Error("Failed to remove invalid push registrations");
  }
  const rejected = tickets.filter((ticket) => ticket.status === "error").length;
  if (rejected > 0) logger.warn("Expo rejected push tickets", { rejected, type });
}
