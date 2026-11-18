// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import { apiError, apiJson, apiOptions, apiRoute } from "@/app/api/v1/_lib/http";
import { getSharedRateLimiter } from "@/src/infrastructure/rate-limit";

const token = "a".repeat(43);
const url = "https://papelzinho.app/api/v1/participant";
const handler = apiRoute({ auth: "accessToken", operation: "test" }, (_request, credential) => {
  expect(credential).toEqual({ accessToken: token });
  return apiJson({ ok: true });
});

function request(path = url, authorization?: string, method = "GET", ip = "192.0.2.1") {
  const headers = new Headers({ "x-real-ip": ip, origin: "https://example.test" });
  if (authorization) headers.set("Authorization", authorization);
  return new Request(path, { headers, method });
}

beforeEach(() => getSharedRateLimiter().reset());

describe("API v1 HTTP boundary", () => {
  it("uses only the route's named credential and sets private response headers", async () => {
    const response = await handler(request(url, "bEaReR " + token));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("private, no-store");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });

  it.each([undefined, "Basic abc", "Bearer bad", "Bearer " + token + ", Bearer " + token])(
    "refuses missing or malformed Bearer credentials",
    async (authorization) => {
      const response = await handler(request(url, authorization));
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: { code: "INVALID_LINK", message: expect.any(String) },
      });
    }
  );

  it.each([url + "?Access%5FToken=bad", url + "/" + token, url + "?other=" + token])(
    "refuses credentials in the URL",
    async (path) => {
      const response = await handler(request(path, "Bearer " + token));
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("INVALID_INPUT");
    }
  );

  it("closes CORS preflight", async () => {
    const response = await apiOptions(request(url, undefined, "OPTIONS"));
    expect(response.status).toBe(405);
    expect(response.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });

  it("shares the general IP quota across routes and adds the write limit", async () => {
    const write = apiRoute({ auth: "none", operation: "write", policy: "api_v1_write" }, () =>
      apiJson({})
    );
    const read = apiRoute({ auth: "none", operation: "read" }, () => apiJson({}));
    for (let index = 0; index < 30; index++) expect((await write(request())).status).toBe(200);
    expect((await write(request())).status).toBe(429);
    for (let index = 0; index < 89; index++) expect((await read(request())).status).toBe(200);
    expect((await read(request())).status).toBe(429);
    expect((await read(request(url, undefined, "GET", "192.0.2.2"))).status).toBe(200);
  });

  it("uses the contract error status and envelope", async () => {
    const response = apiError("DRAW_NOT_READY");
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: { code: "DRAW_NOT_READY", message: expect.any(String) },
    });
  });
});
