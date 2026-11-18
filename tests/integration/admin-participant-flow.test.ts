// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createGroupUseCase } from "../../app/_lib/create-group-usecase";
import { getAdminViewUseCase, removeParticipantUseCase } from "../../app/_lib/admin-usecase";
import { joinGroupUseCase } from "../../app/_lib/participant-stubs";
import { resolveParticipantByToken } from "../../app/_lib/participant-view-usecase";
import { useIntegrationDatabase } from "./harness";

const DAY_MS = 86_400_000;

describe("create → admin → join → area → remove (BE-03)", () => {
  const harness = useIntegrationDatabase();

  it("wires admin panel and participant area against Supabase", async () => {
    expect(harness.available).toBe(true);
    const exchangeDate = new Date(Date.now() + 10 * DAY_MS).toISOString().slice(0, 10);

    const created = await createGroupUseCase({
      name: "Amigo Secreto BE-03",
      maxValueCents: 9000,
      exchangeDate,
      location: "Sala 3",
      requestId: "b1f9c7e3-5d4a-4b2c-8c3f-8e7d6b5a4c3e",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const inviteToken = created.value.inviteUrl.split("/g/")[1]!;
    const adminToken = created.value.adminUrl.split("/admin/")[1]!;

    const emptyPanel = await getAdminViewUseCase(adminToken);
    expect(emptyPanel.ok).toBe(true);
    if (!emptyPanel.ok) return;
    expect(emptyPanel.value.group.name).toBe("Amigo Secreto BE-03");
    expect(emptyPanel.value.participantCount).toBe(0);
    expect(emptyPanel.value.inviteUrl).toContain(`/g/${inviteToken}`);

    expect(await getAdminViewUseCase("unknown-admin-token")).toEqual({
      ok: false,
      error: { code: "INVALID_LINK" },
    });

    const joined = await joinGroupUseCase({ inviteToken, displayName: "Ana" });
    expect(joined.ok).toBe(true);
    if (!joined.ok) return;

    const area = await resolveParticipantByToken(joined.value.accessToken);
    expect(area.ok).toBe(true);
    if (!area.ok) return;
    expect(area.value.view.displayName).toBe("Ana");
    expect(area.value.view.group.name).toBe("Amigo Secreto BE-03");
    expect(area.value.groupId).toBe(joined.value.groupId);
    expect(area.value.expiresAt).toBe(joined.value.expiresAt);
    expect(area.value.view.ownWishItems).toEqual([]);

    const panel = await getAdminViewUseCase(adminToken);
    expect(panel.ok).toBe(true);
    if (!panel.ok) return;
    expect(panel.value.participantCount).toBe(1);
    expect(panel.value.participants[0]?.displayName).toBe("Ana");
    const participantId = panel.value.participants[0]!.id;

    const removed = await removeParticipantUseCase(adminToken, participantId);
    expect(removed.ok).toBe(true);
    if (!removed.ok) return;
    expect(removed.value.participantCount).toBe(0);

    expect(await resolveParticipantByToken(joined.value.accessToken)).toEqual({
      ok: false,
      error: { code: "INVALID_LINK" },
    });

    const after = await getAdminViewUseCase(adminToken);
    expect(after.ok).toBe(true);
    if (!after.ok) return;
    expect(after.value.participantCount).toBe(0);
    expect(after.value.participants).toEqual([]);
  });
});
