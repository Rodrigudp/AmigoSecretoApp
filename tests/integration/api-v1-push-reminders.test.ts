// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getTodayInSaoPaulo } from "@/src/application/create-group";
import { useIntegrationDatabase } from "./harness";

function cronRequest(secret: string) {
  return new Request("http://127.0.0.1/api/internal/push/exchange-reminders", {
    method: "POST",
    headers: { Authorization: "Bearer " + secret },
  });
}

describe("Push reminders", () => {
  const harness = useIntegrationDatabase();
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("authorizes the job, claims once in parallel, and removes an invalid Expo token", async () => {
    vi.stubEnv("PUSH_CRON_SECRET", "example-reminder-secret-with-enough-length");
    vi.stubEnv("EXPO_ACCESS_TOKEN", "example-expo-access");
    const { createGroupUseCase } = await import("@/app/_lib/create-group-usecase");
    const { POST } = await import("@/app/api/internal/push/exchange-reminders/route");
    const { tokenService } = await import("@/src/infrastructure/tokens");
    const exchangeDate = getTodayInSaoPaulo(new Date(Date.now() + 2 * 86_400_000));
    const created = await createGroupUseCase({
      name: "Nome privado",
      location: "Local privado",
      maxValueCents: 5000,
      exchangeDate,
      requestId: randomUUID(),
    });
    if (!created.ok) throw new Error("Group creation failed");
    const hash = tokenService.hash(created.value.adminUrl.split("/admin/")[1]);
    const { data: group } = await harness.db
      .from("groups")
      .select("id")
      .eq("admin_token_hash", hash)
      .single();
    if (!group) throw new Error("Group not found");
    const { error } = await harness.db.rpc("register_push_token", {
      p_group_id: group.id,
      p_credential_hash: hash,
      p_role: "organizer",
      p_platform: "ios",
      p_expo_push_token: "ExpoPushToken[invalid-example]",
    });
    expect(error).toBeNull();

    const nativeFetch = globalThis.fetch;
    const send = vi.fn<(init?: RequestInit) => Promise<Response>>(async () =>
      Response.json({
        data: [{ status: "error", details: { error: "DeviceNotRegistered" } }],
      })
    );
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) =>
      String(input).startsWith("https://exp.host/") ? send(init) : nativeFetch(input, init)
    );
    expect((await POST(cronRequest("wrong"))).status).toBe(401);
    const results = await Promise.all([
      POST(cronRequest("example-reminder-secret-with-enough-length")),
      POST(cronRequest("example-reminder-secret-with-enough-length")),
    ]);
    expect(results.map((result) => result.status)).toEqual([200, 200]);
    expect(send).toHaveBeenCalledTimes(1);
    const sent = send.mock.calls[0]?.[0];
    expect(sent?.headers).toMatchObject({ Authorization: "Bearer example-expo-access" });
    expect(JSON.parse(String(sent?.body))).toEqual([
      {
        to: "ExpoPushToken[invalid-example]",
        title: "Encontro de amigo secreto",
        body: "Faltam 2 dias para o encontro.",
        data: { groupId: group.id, type: "exchange_reminder" },
      },
    ]);
    const { data: registrations } = await harness.db
      .from("push_tokens")
      .select("id")
      .eq("group_id", group.id);
    const { data: marks } = await harness.db
      .from("push_reminders_sent")
      .select("reminder_date")
      .eq("group_id", group.id);
    expect(registrations).toEqual([]);
    expect(marks).toEqual([{ reminder_date: getTodayInSaoPaulo(new Date()) }]);
  });
});
