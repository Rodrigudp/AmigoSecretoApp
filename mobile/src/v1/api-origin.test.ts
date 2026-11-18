import { localWebApiEnabled, nativeApiEndpoint } from "./api-origin";
import { createHttpApi } from "./client";

it("uses the configured Next origin and appends the v1 path once", async () => {
  const fetcher = jest.fn<Promise<Response>, [string, RequestInit]>().mockResolvedValue({
    ok: true,
    json: async () => ({ role: "participant" }),
  } as Response);
  await createHttpApi(fetcher, nativeApiEndpoint("http://127.0.0.1:3000", true)).summary("fixture");
  expect(fetcher.mock.calls[0][0]).toBe("http://127.0.0.1:3000/api/v1/my-groups/summary");
  expect(nativeApiEndpoint()).toBe("https://papelzinho.app/api/v1");
});

it("rejects insecure production and origins with credentials or a path", () => {
  expect(() => nativeApiEndpoint("http://127.0.0.1:3000")).toThrow();
  expect(() => nativeApiEndpoint("https://user:pass@example.com")).toThrow();
  expect(() => nativeApiEndpoint("https://papelzinho.app/api/v1")).toThrow();
});

it("allows live web only during development with browser and API on loopback", () => {
  const target = "http://127.0.0.1:3000";
  expect(localWebApiEnabled(true, "localhost", target)).toBe(true);
  expect(localWebApiEnabled(false, "localhost", target)).toBe(false);
  expect(localWebApiEnabled(true, "example.com", target)).toBe(false);
  expect(localWebApiEnabled(true, "localhost", "https://papelzinho.app")).toBe(false);
  expect(localWebApiEnabled(true, "localhost", "http://localhost:3000/?secret=fixture")).toBe(
    false
  );
});
