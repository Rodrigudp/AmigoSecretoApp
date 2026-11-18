import type { ApiV1 } from "./contract";

const endpoint = "https://papelzinho.app/api/v1";
const offline = "Sem conexão no momento. Verifique a internet e tente de novo.";

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  credential?: string;
  resume?: string;
  body?: object;
}

function itemId(id: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new ApiError("INVALID_INPUT", "Identificador inválido.");
  return id;
}

export function createHttpApi(fetcher: typeof fetch = fetch): ApiV1 {
  async function request<Result>(path: string, options: RequestOptions = {}): Promise<Result> {
    const { method = "GET", credential, resume, body } = options;
    const headers = new Headers({ Accept: "application/json" });
    if (credential) headers.set("Authorization", `Bearer ${credential}`);
    if (resume) headers.set("X-Resume-Participant-Token", resume);
    if (body) headers.set("Content-Type", "application/json");

    let response: Response;
    try {
      response = await fetcher(endpoint + path, {
        method,
        headers,
        body: body && JSON.stringify(body),
        redirect: "error",
        cache: "no-store",
      });
    } catch {
      throw new ApiError("OFFLINE", offline);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const code = data?.error?.code;
      const message = data?.error?.message;
      throw new ApiError(
        typeof code === "string" ? code : "INTERNAL_ERROR",
        typeof message === "string" ? message : offline
      );
    }
    if (!data || typeof data !== "object") throw new ApiError("INTERNAL_ERROR", offline);
    return data as Result;
  }

  return {
    create: (body) => request("/groups", { method: "POST", body }),
    summary: (credential) => request("/my-groups/summary", { credential }),
    invitation: (credential, resume) => request("/invite", { credential, resume }),
    join: (credential, displayName) =>
      request("/invite/join", { method: "POST", credential, body: { displayName } }),
    participant: (credential) => request("/participant", { credential }),
    wishes: (credential) => request("/participant/wishes", { credential }),
    addWish: (credential, body) =>
      request("/participant/wishes", { method: "POST", credential, body }),
    updateWish: (credential, id, body) =>
      request(`/participant/wishes/${itemId(id)}`, { method: "PATCH", credential, body }),
    removeWish: (credential, id) =>
      request(`/participant/wishes/${itemId(id)}`, { method: "DELETE", credential }),
    reveal: (credential) => request("/participant/reveal", { method: "POST", credential }),
    admin: (credential) => request("/admin", { credential }),
    removeParticipant: (credential, id) =>
      request(`/admin/participants/${itemId(id)}`, { method: "DELETE", credential }),
    draw: (credential, expectedParticipantCount) =>
      request("/admin/draw", { method: "POST", credential, body: { expectedParticipantCount } }),
    registerPush: (credential, body) =>
      request("/push-tokens", { method: "POST", credential, body }),
  };
}
