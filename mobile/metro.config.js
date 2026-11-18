const http = require("node:http");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const upstream = localUpstream();

function localUpstream() {
  if (process.env.EXPO_PUBLIC_MOBILE_API !== "live" || !process.env.EXPO_PUBLIC_API_URL)
    return null;
  const target = URL.parse(process.env.EXPO_PUBLIC_API_URL);
  const loopback = ["localhost", "127.0.0.1", "[::1]"];
  if (
    target?.protocol === "http:" &&
    loopback.includes(target.hostname) &&
    target.href === target.origin + "/"
  )
    return target;
  return null;
}

function proxyApi(req, res, next) {
  if (!req.url?.startsWith("/api/v1/")) return next();

  // Keep this bridge same-origin and on loopback. Never forward cookies or redirects.
  const host = req.headers.host ?? "";
  const validHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host);
  const origin = req.headers.origin;
  const fetchSite = req.headers["sec-fetch-site"];
  const target = new URL(req.url, upstream);
  if (
    !validHost ||
    (origin && origin !== `http://${host}`) ||
    (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") ||
    !["GET", "POST", "PATCH", "DELETE"].includes(req.method) ||
    target.pathname !== req.url
  ) {
    res.writeHead(403).end();
    return;
  }

  const headers = {};
  for (const name of [
    "accept",
    "authorization",
    "content-type",
    "content-length",
    "x-resume-participant-token",
  ]) {
    if (req.headers[name]) headers[name] = req.headers[name];
  }

  const request = http.request(target, { method: req.method, headers }, (response) => {
    const status = response.statusCode ?? 502;
    const contentType = response.headers["content-type"];
    if ((status >= 300 && status < 400) || !/^application\/json(?:;|$)/i.test(contentType ?? "")) {
      response.resume();
      res.writeHead(502).end();
      return;
    }
    res.writeHead(status, {
      "content-type": "application/json",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
    });
    response.on("error", () => res.destroy());
    response.pipe(res);
  });
  request.on("error", () => {
    if (res.headersSent) res.destroy();
    else res.writeHead(502).end();
  });
  res.on("close", () => request.destroy());
  req.pipe(request);
}

if (upstream) {
  const enhance = config.server.enhanceMiddleware;
  config.server.enhanceMiddleware = (middleware, metro) => {
    const handle = enhance ? enhance(middleware, metro) : middleware;
    return (req, res, next) => proxyApi(req, res, () => handle(req, res, next));
  };
}
module.exports = config;
