// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createGroupUseCase } from "../../app/_lib/create-group-usecase";
import { getInviteViewUseCase, joinGroupUseCase } from "../../app/_lib/participant-stubs";
import { useIntegrationDatabase } from "./harness";

const DAY_MS = 86_400_000;

describe("create → invite → join adapters (BE-02)", () => {
  const harness = useIntegrationDatabase();

  it("persists a group, serves the invite view, and joins a participant", async () => {
    expect(harness.available).toBe(true);
    const exchangeDate = new Date(Date.now() + 10 * DAY_MS).toISOString().slice(0, 10);

    const created = await createGroupUseCase({
      name: "Amigo Secreto BE-02",
      maxValueCents: 7500,
      exchangeDate,
      location: "Sala 2",
      requestId: "a0e8b6d2-4c3f-4f1a-9b2e-7d6c5a4b3c2d",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const inviteToken = created.value.inviteUrl.split("/g/")[1]!;
    const { data: groupRow } = await harness.db
      .from("groups")
      .select("id, name, admin_token_hash")
      .eq("invite_token", inviteToken)
      .single();
    expect(groupRow?.name).toBe("Amigo Secreto BE-02");
    expect(groupRow?.admin_token_hash).toMatch(/^[0-9a-f]{64}$/);

    const invite = await getInviteViewUseCase({ inviteToken });
    expect(invite.ok).toBe(true);
    if (!invite.ok) return;
    expect(invite.value.group).toMatchObject({
      name: "Amigo Secreto BE-02",
      maxValueCents: 7500,
      exchangeDate,
      location: "Sala 2",
      status: "open",
    });
    expect(invite.value.groupId).toBe(groupRow!.id);

    const { count: openedCount } = await harness.db
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupRow!.id)
      .eq("type", "invite_opened");
    expect(openedCount).toBe(1);

    const joined = await joinGroupUseCase({ inviteToken, displayName: "Ana" });
    expect(joined.ok).toBe(true);
    if (!joined.ok) return;
    expect(joined.value.personalUrl).toContain(`/p/${joined.value.accessToken}`);

    const { data: participant } = await harness.db
      .from("participants")
      .select("display_name, access_token_hash")
      .eq("group_id", groupRow!.id)
      .single();
    expect(participant?.display_name).toBe("Ana");
    expect(participant?.access_token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(participant?.access_token_hash).not.toBe(joined.value.accessToken);
  });
});
