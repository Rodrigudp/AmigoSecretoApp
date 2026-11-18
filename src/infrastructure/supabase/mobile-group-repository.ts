import type { ServerSupabaseClient } from "./client";
import { tokenService } from "../tokens";

const summaryFields = "id, name, status, exchange_date, max_value_cents, expires_at";

type Role = "participant" | "organizer";

export async function resolveMobileGroup(client: ServerSupabaseClient, token: string) {
  const credentialHash = tokenService.hash(token);
  const now = new Date().toISOString();
  const participant = await client
    .from("participants")
    .select(`display_name, group:groups!participants_group_id_fkey!inner(${summaryFields})`)
    .eq("access_token_hash", credentialHash)
    .is("removed_at", null)
    .gt("group.expires_at", now)
    .maybeSingle();
  if (participant.error) throw new Error("Participant credential lookup failed");
  if (participant.data) {
    return buildSummary(
      participant.data.group,
      "participant",
      participant.data.display_name,
      credentialHash
    );
  }

  const organizer = await client
    .from("groups")
    .select(summaryFields)
    .eq("admin_token_hash", credentialHash)
    .gt("expires_at", now)
    .maybeSingle();
  if (organizer.error) throw new Error("Organizer credential lookup failed");
  return organizer.data ? buildSummary(organizer.data, "organizer", null, credentialHash) : null;
}

function buildSummary(
  group: {
    id: string;
    name: string;
    status: string;
    exchange_date: string;
    max_value_cents: number;
    expires_at: string;
  },
  role: Role,
  displayName: string | null,
  credentialHash: string
) {
  return {
    credentialHash,
    summary: {
      groupId: group.id,
      groupName: group.name,
      role,
      displayName,
      status: group.status,
      exchangeDate: group.exchange_date,
      maxValueCents: group.max_value_cents,
      expiresAt: group.expires_at,
    },
  };
}
