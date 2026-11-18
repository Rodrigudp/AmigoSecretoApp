import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../app/ads.txt/route";
import { publisherId } from "../../app/_lib/ads-config";

afterEach(() => vi.unstubAllEnvs());
describe("ads.txt", () => {
  it("returns 404 for missing or invalid publisher IDs", () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "");
    expect(GET(new Request("https://example.com/ads.txt")).status).toBe(404);
    expect(publisherId("pub-123\nmalicious")).toBeNull();
  });
  it("returns the authorized publisher record", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "pub-1234567890123456");
    const response = GET(new Request("https://example.com/ads.txt"));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(
      "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n"
    );
  });
});
