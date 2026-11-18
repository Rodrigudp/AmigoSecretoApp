import { createHttpApi } from "./client";
import { revokePush } from "./push-registration";

it("revokes only the current device and then removes the local receipt", async () => {
  const fetcher = jest.fn<Promise<Response>, [string, RequestInit]>().mockResolvedValue({
    ok: true, json: async () => ({ removed: true, role: "participant" }),
  } as Response);
  const clear = jest.fn(async () => {});
  await revokePush(createHttpApi(fetcher), "sample-access", "ExpoPushToken[sample]", clear);

  const [url, options] = fetcher.mock.calls[0];
  expect(url).toBe("https://papelzinho.app/api/v1/push-tokens");
  expect(options.method).toBe("DELETE");
  expect(new Headers(options.headers).get("Authorization")).toBe("Bearer sample-access");
  expect(JSON.parse(String(options.body))).toEqual({ expoPushToken: "ExpoPushToken[sample]" });
  expect(clear).toHaveBeenCalledTimes(1);
});

it("keeps the local receipt when removal fails so it can be retried", async () => {
  const fetcher = jest.fn<Promise<Response>, [string, RequestInit]>()
    .mockRejectedValueOnce(new Error("network unavailable"))
    .mockResolvedValueOnce({
      ok: true, json: async () => ({ removed: true, role: "participant" }),
    } as Response);
  const clear = jest.fn(async () => {});
  const remove = () => revokePush(createHttpApi(fetcher), "sample-access", "ExpoPushToken[sample]", clear);
  await expect(remove()).rejects.toMatchObject({ code: "OFFLINE" });
  expect(clear).not.toHaveBeenCalled();
  await expect(remove()).resolves.toBeUndefined();
  expect(clear).toHaveBeenCalledTimes(1);
});
