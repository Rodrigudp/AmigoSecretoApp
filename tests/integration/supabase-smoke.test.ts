// @vitest-environment node
import { describe, expect, it } from "vitest";
import { useIntegrationDatabase } from "./harness";

describe("local Supabase integration smoke (BE-01, DB-04)", () => {
  const harness = useIntegrationDatabase();

  it("creates a group via create_group_once, joins via join_group, and reads back state", async () => {
    const inviteToken = "smoke-invite-token-0123456789abcdef";
    const { data: created, error: createError } = await harness.db.rpc("create_group_once", {
      p_request_id: "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
      p_name: "Amigo Secreto da Firma",
      p_max_value_cents: 10000,
      p_exchange_date: "2026-12-20",
      p_location: "Escritório Central",
      p_invite_token: inviteToken,
      p_admin_token_hash: "a".repeat(64),
      p_expires_at: "2027-02-18T23:59:59.999Z",
    });

    expect(createError).toBeNull();
    expect(created).toHaveLength(1);
    const [groupRow] = created!;
    expect(groupRow.invite_token).toBe(inviteToken);
    expect(groupRow.was_replay).toBe(false);

    const { data: joined, error: joinError } = await harness.db.rpc("join_group", {
      p_invite_token: inviteToken,
      p_display_name: "Ana",
      p_access_token_hash: "b".repeat(64),
    });

    expect(joinError).toBeNull();
    expect(joined).toHaveLength(1);
    const [joinedRow] = joined!;
    expect(joinedRow.display_name).toBe("Ana");
    expect(joinedRow.group_id).toBe(groupRow.group_id);

    const { data: persistedGroup, error: readError } = await harness.db
      .from("groups")
      .select("id, name, status")
      .eq("id", groupRow.group_id)
      .single();

    expect(readError).toBeNull();
    expect(persistedGroup).toEqual({
      id: groupRow.group_id,
      name: "Amigo Secreto da Firma",
      status: "open",
    });
  });
});
