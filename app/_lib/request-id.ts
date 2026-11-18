const KEY = "amigo-secreto:create-group-request-id";

/** Same id for every retry of one submission (idempotency, grupos.md §2.2). */
export function getRequestId(): string {
  const existing = window.sessionStorage.getItem(KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.sessionStorage.setItem(KEY, id);
  return id;
}

export function clearRequestId(): void {
  window.sessionStorage.removeItem(KEY);
}
