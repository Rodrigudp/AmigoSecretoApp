// @vitest-environment node
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { useIntegrationDatabase } from "./harness";

function request(path: string, method = "GET", token?: string, body?: unknown): Request {
  const headers = new Headers({ "x-real-ip": "192.0.2.10" });
  if (token) headers.set("Authorization", "Bearer " + token);
  if (body) headers.set("Content-Type", "application/json");
  return new Request("https://papelzinho.app/api/v1/" + path, {
    headers,
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function responseBody(response: Response, expectedStatus: number) {
  expect(response.status).toBe(expectedStatus);
  expect(response.headers.get("set-cookie")).toBeNull();
  return response.json();
}

describe("API v1 mobile on Supabase", () => {
  const harness = useIntegrationDatabase();

  it("creates, joins, resolves both roles and manages only the caller's push tokens", async () => {
    const groups = await import("@/app/api/v1/groups/route");
    const invite = await import("@/app/api/v1/invite/route");
    const join = await import("@/app/api/v1/invite/join/route");
    const participant = await import("@/app/api/v1/participant/route");
    const summary = await import("@/app/api/v1/my-groups/summary/route");
    const push = await import("@/app/api/v1/push-tokens/route");

    const group = await responseBody(
      await groups.POST(
        request("groups", "POST", undefined, {
          name: "Papelzinho no app",
          maxValueCents: 6500,
          exchangeDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
          requestId: randomUUID(),
        })
      ),
      201
    );
    expect(group.inviteUrl).toContain("/g/" + group.inviteToken);

    const inviteView = await responseBody(
      await invite.GET(request("invite", "GET", group.inviteToken)),
      200
    );
    const joined = await responseBody(
      await join.POST(
        request("invite/join", "POST", group.inviteToken, {
          displayName: "Ana",
        })
      ),
      201
    );
    expect(joined.groupId).toBe(inviteView.groupId);
    expect(joined.personalUrl).toContain("/p/" + joined.accessToken);

    const denied = await responseBody(
      await participant.GET(request("participant", "GET", group.adminToken)),
      401
    );
    expect(denied.error.code).toBe("INVALID_LINK");

    const itemUrl = "https://www.amazon.com.br/dp/B000000000?tag=affiliate-20";
    const { data: person } = await harness.db
      .from("participants")
      .select("id")
      .eq("group_id", joined.groupId)
      .single();
    if (!person) throw new Error("Missing participant");
    const { error } = await harness.db.from("wish_items").insert({
      participant_id: person.id,
      title: "Livro",
      url: itemUrl,
      affiliate_url: itemUrl,
      store: "amazon",
    });
    expect(error).toBeNull();
    const area = await responseBody(
      await participant.GET(request("participant", "GET", joined.accessToken)),
      200
    );
    expect(area.view.displayName).toBe("Ana");
    expect(area.view.ownWishItems).toEqual([
      { id: expect.any(String), title: "Livro", url: itemUrl.split("?")[0], note: null },
    ]);

    for (const [token, role] of [
      [joined.accessToken, "participant"],
      [group.adminToken, "organizer"],
    ]) {
      const body = await responseBody(
        await summary.GET(request("my-groups/summary", "GET", token)),
        200
      );
      expect(body).toMatchObject({
        groupId: joined.groupId,
        groupName: "Papelzinho no app",
        role,
        status: "open",
      });
      expect(body).not.toHaveProperty("credentialHash");
      const saved = await responseBody(
        await push.POST(
          request("push-tokens", "POST", token, {
            expoPushToken: "ExpoPushToken[test-device]",
            platform: "ios",
          })
        ),
        200
      );
      expect(saved).toEqual({ registered: true, role });
    }

    const removed = await responseBody(
      await push.DELETE(
        request("push-tokens", "DELETE", joined.accessToken, {
          expoPushToken: "ExpoPushToken[test-device]",
        })
      ),
      200
    );
    expect(removed).toEqual({ removed: true, role: "participant" });
    const remaining = await harness.db
      .from("push_tokens")
      .select("role")
      .eq("group_id", joined.groupId);
    expect(remaining.data).toEqual([{ role: "organizer" }]);
  });
});
