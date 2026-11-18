import { describe, it, expect } from "vitest";
import { GET, HEAD } from "@/app/api/health/route";

describe("Healthcheck API (OPS-01 / Uptime Monitor)", () => {
  it("responds HTTP 200 with JSON status payload on GET", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.version).toBe("0.1.0");
    expect(typeof data.timestamp).toBe("string");
    expect(typeof data.uptime).toBe("number");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("responds HTTP 200 with empty body on HEAD", async () => {
    const response = await HEAD();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
