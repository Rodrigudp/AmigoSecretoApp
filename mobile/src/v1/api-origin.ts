const productionOrigin = "https://papelzinho.app";

export function isLoopback(host: string) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(host);
}

export function localWebApiEnabled(development: boolean, hostname: string, apiUrl?: string) {
  if (!development || !isLoopback(hostname) || !apiUrl) return false;
  try {
    const target = new URL(apiUrl);
    return (
      target.protocol === "http:" &&
      isLoopback(target.hostname) &&
      target.href === target.origin + "/"
    );
  } catch {
    return false;
  }
}

export function nativeApiEndpoint(apiUrl = productionOrigin, development = false) {
  const target = new URL(apiUrl);
  const local = isLoopback(target.hostname) || target.hostname === "10.0.2.2";
  if (
    target.href !== target.origin + "/" ||
    !(target.protocol === "https:" || (development && local && target.protocol === "http:"))
  ) {
    throw new Error("Invalid mobile API origin");
  }
  return target.origin + "/api/v1";
}
