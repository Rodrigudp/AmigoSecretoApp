import { createHttpApi } from "./client";
import { createMockApi } from "./mock";

it("sends the personal credential only in Authorization and opts out of caching", async () => {
  const fetcher = jest.fn<Promise<Response>, [string, RequestInit]>().mockResolvedValue({
    ok: true, json: async () => ({ recipientName: "Ana", wishItems: [], drawVersion: 1 }),
  } as Response);
  await createHttpApi(fetcher).reveal("sample-credential");

  const [url, options] = fetcher.mock.calls[0];
  expect(url).toBe("https://papelzinho.app/api/v1/participant/reveal");
  expect(options?.method).toBe("POST");
  expect(options?.cache).toBe("no-store");
  expect(options?.body).toBeUndefined();
  expect(new Headers(options?.headers).get("Authorization")).toBe("Bearer sample-credential");
});

it("isolates created groups and keeps organizer and participant access distinct", async () => {
  const api = createMockApi();
  const input = { requestId: "first", name: "Família", maxValueCents: 5000, exchangeDate: "2027-12-24", location: null };
  const first = await api.create(input);
  const retry = await api.create(input);
  const second = await api.create({ ...input, requestId: "second", name: "Turma" });
  const joined = await api.join(first.inviteToken, "Ana");

  expect(retry).toEqual(first);
  expect((await api.summary(first.adminToken)).groupName).toBe("Família");
  expect((await api.summary(second.adminToken)).groupName).toBe("Turma");
  expect((await api.summary(joined.accessToken)).role).toBe("participant");
  await expect(api.participant(first.adminToken)).rejects.toMatchObject({ code: "INVALID_LINK" });
  await expect(api.reveal(joined.accessToken)).rejects.toMatchObject({ code: "DRAW_NOT_READY" });
});
