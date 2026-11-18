// @vitest-environment node
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGroupUseCase } from "../../app/_lib/create-group-usecase";
import { joinGroupUseCase } from "../../app/_lib/participant-stubs";
import { DELETE, PATCH } from "../../app/api/v1/participant/wishes/[itemId]/route";
import { GET, POST } from "../../app/api/v1/participant/wishes/route";
import { getSharedRateLimiter } from "../../src/infrastructure/rate-limit";
import { useIntegrationDatabase } from "./harness";

vi.mock("server-only", () => ({}));

const WISHES_URL = "https://papelzinho.app/api/v1/participant/wishes";
const ORIGINAL_URL = "https://www.amazon.com.br/dp/B000000000?ref=gift";
const AFFILIATE_URL = ORIGINAL_URL + "&tag=example-20";

function request(method: string, token?: string, path = "", body?: unknown): Request {
  const headers = new Headers({ "x-forwarded-for": "192.0.2.42" });
  if (token) headers.set("Authorization", "Bearer " + token);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  return new Request(WISHES_URL + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function itemContext(itemId: string) {
  return { params: Promise.resolve({ itemId }) };
}

async function expectError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(await response.json()).toEqual({ error: { code, message: expect.any(String) } });
}

describe("API v1 participant wishes", () => {
  const harness = useIntegrationDatabase();
  beforeEach(() => getSharedRateLimiter().reset());

  async function seedGroup() {
    const created = await createGroupUseCase({
      name: "API v1 Wishes",
      maxValueCents: 5000,
      exchangeDate: new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10),
      location: null,
      requestId: randomUUID(),
    });
    if (!created.ok) throw new Error("Failed to seed the group");
    const inviteToken = created.value.inviteUrl.split("/g/")[1]!;
    const adminToken = created.value.adminUrl.split("/admin/")[1]!;
    const owner = await joinGroupUseCase({ inviteToken, displayName: "Ana" });
    const other = await joinGroupUseCase({ inviteToken, displayName: "Bruno" });
    if (!owner.ok || !other.ok) throw new Error("Failed to seed the participants");
    return {
      groupId: owner.value.groupId,
      ownerToken: owner.value.accessToken,
      otherToken: other.value.accessToken,
      inviteToken,
      adminToken,
    };
  }

  it("creates, lists, updates and deletes an item with only the mobile fields", async () => {
    const { groupId, ownerToken } = await seedGroup();
    const response = await POST(
      request("POST", ownerToken, "", { title: "Livro", url: ORIGINAL_URL, note: "Capa dura" })
    );
    expect(response.status).toBe(201);
    const { item } = await response.json();
    const expectedItem = {
      id: expect.any(String),
      title: "Livro",
      url: ORIGINAL_URL,
      note: "Capa dura",
    };
    expect(item).toEqual(expectedItem);

    const created = await harness.db
      .from("wish_items")
      .select("affiliate_url, store")
      .eq("id", item.id)
      .single();
    expect(created.error).toBeNull();
    expect(created.data).toEqual({ affiliate_url: null, store: null });

    const webAffiliate = await harness.db
      .from("wish_items")
      .update({ url: AFFILIATE_URL, affiliate_url: AFFILIATE_URL + "web", store: "amazon" })
      .eq("id", item.id);
    expect(webAffiliate.error).toBeNull();

    const listed = await GET(request("GET", ownerToken));
    expect(listed.status).toBe(200);
    expect(listed.headers.get("cache-control")).toContain("no-store");
    expect(listed.headers.has("access-control-allow-origin")).toBe(false);
    expect(await listed.json()).toEqual({ items: [expectedItem] });

    const path = "/" + item.id;
    const updated = await PATCH(
      request("PATCH", ownerToken, path, { title: "Outro livro", url: null }),
      itemContext(item.id)
    );
    expect(updated.status).toBe(200);
    expect(await updated.json()).toEqual({
      item: { id: item.id, title: "Outro livro", url: null, note: null },
    });

    const removed = await DELETE(request("DELETE", ownerToken, path), itemContext(item.id));
    expect(removed.status).toBe(200);
    expect(await removed.json()).toEqual({ id: item.id });
    const empty = await GET(request("GET", ownerToken));
    expect(await empty.json()).toEqual({ items: [] });

    const events = await harness.db
      .from("events")
      .select("id")
      .eq("group_id", groupId)
      .eq("type", "affiliate_click");
    expect(events.error).toBeNull();
    expect(events.data).toEqual([]);
  });

  it("requires the participant Bearer and hides items that belong to someone else", async () => {
    const { ownerToken, otherToken, inviteToken, adminToken } = await seedGroup();
    await expectError(await GET(request("GET")), 401, "INVALID_LINK");
    await expectError(await GET(request("GET", inviteToken)), 401, "INVALID_LINK");
    await expectError(await GET(request("GET", adminToken)), 401, "INVALID_LINK");
    await expectError(
      await GET(request("GET", ownerToken, "?accessToken=hidden")),
      400,
      "INVALID_INPUT"
    );

    const created = await POST(request("POST", ownerToken, "", { title: "Privado" }));
    expect(created.status).toBe(201);
    const { item } = await created.json();
    const path = "/" + item.id;
    const list = await GET(request("GET", otherToken));
    expect(await list.json()).toEqual({ items: [] });
    await expectError(
      await PATCH(request("PATCH", otherToken, path, { title: "Alterado" }), itemContext(item.id)),
      404,
      "WISH_ITEM_NOT_FOUND"
    );
    await expectError(
      await DELETE(request("DELETE", otherToken, path), itemContext(item.id)),
      404,
      "WISH_ITEM_NOT_FOUND"
    );
  });

  it("enforces the item cap and the shared write limit", async () => {
    const { ownerToken } = await seedGroup();
    for (let i = 0; i < 20; i += 1) {
      const created = await POST(request("POST", ownerToken, "", { title: "Livro " + i }));
      expect(created.status).toBe(201);
    }
    for (let i = 0; i < 10; i += 1) {
      await expectError(
        await POST(request("POST", ownerToken, "", { title: "Lista cheia" })),
        409,
        "WISH_LIST_FULL"
      );
    }
    const id = randomUUID();
    await expectError(
      await PATCH(request("PATCH", ownerToken, "/" + id, { title: "Livro" }), itemContext(id)),
      429,
      "RATE_LIMITED"
    );
    await expectError(
      await DELETE(request("DELETE", ownerToken, "/" + id), itemContext(id)),
      429,
      "RATE_LIMITED"
    );
    expect((await GET(request("GET", ownerToken))).status).toBe(200);
  });

  it("validates write payloads and item IDs", async () => {
    const { ownerToken } = await seedGroup();
    await expectError(
      await POST(request("POST", ownerToken, "", { title: "" })),
      400,
      "INVALID_INPUT"
    );
    await expectError(
      await PATCH(
        request("PATCH", ownerToken, "/bad-id", { title: "Livro" }),
        itemContext("bad-id")
      ),
      400,
      "INVALID_INPUT"
    );
    await expectError(
      await DELETE(request("DELETE", ownerToken, "/bad-id"), itemContext("bad-id")),
      400,
      "INVALID_INPUT"
    );
    await expectError(
      await POST(
        new Request(WISHES_URL, {
          method: "POST",
          headers: { Authorization: "Bearer " + ownerToken, "Content-Type": "application/json" },
          body: "{",
        })
      ),
      400,
      "INVALID_INPUT"
    );
  });
});
