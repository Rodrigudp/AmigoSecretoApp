// @vitest-environment node
import { describe, expect, it } from "vitest";
import { useIntegrationDatabase } from "./harness";

describe("push token registration concurrency (DB-APP-01)", () => {
  const harness = useIntegrationDatabase();

  it("keeps five devices when registrations for a credential arrive in parallel", async () => {
    const db = harness.db;
    const credentialHash = "a".repeat(64);
    const { data: group, error: groupError } = await db
      .from("groups")
      .insert({
        name: "Push concurrency",
        max_value_cents: 5000,
        exchange_date: "2099-12-01",
        admin_token_hash: credentialHash,
        invite_token: "invite-push-concurrency-012345",
        expires_at: "2099-12-31T00:00:00Z",
        create_request_id: crypto.randomUUID(),
      })
      .select("id")
      .single();
    expect(groupError).toBeNull();

    const devices = Array.from({ length: 10 }, (_, i) => `ExpoPushToken[device-${i}]`);
    const results = await Promise.all(
      devices.map((device) =>
        db.rpc("register_push_token", {
          p_group_id: group!.id,
          p_credential_hash: credentialHash,
          p_role: "organizer",
          p_platform: "ios",
          p_expo_push_token: device,
        }),
      ),
    );
    for (const result of results) {
      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    }

    const { data, error } = await db
      .from("push_tokens")
      .select("expo_push_token")
      .eq("credential_hash", credentialHash);
    expect(error).toBeNull();
    expect(data).toHaveLength(5);
    expect(devices).toEqual(expect.arrayContaining(data!.map((row) => row.expo_push_token)));
  });
});
