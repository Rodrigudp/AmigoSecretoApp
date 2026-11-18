import { TOKEN_HTTP_HEADERS } from "../../app/_lib/token-page-meta";
import { TOKEN_ROUTE_SOURCES } from "../../app/_lib/token-paths";

export type SecurityHeader = { key: string; value: string };
export type NextHeaderRule = { source: string; headers: SecurityHeader[] };
export type CspOptions = { adsEnabled: boolean; isDev?: boolean };

const ADSENSE_SHARED = [
  "https://pagead2.googlesyndication.com",
  "https://*.adtrafficquality.google",
];
const ADSENSE_SCRIPTS = [
  ...ADSENSE_SHARED,
  "https://adservice.google.com",
  "https://www.googletagservices.com",
];
const ADSENSE_IMAGES = [
  ...ADSENSE_SHARED,
  "https://googleads.g.doubleclick.net",
  "https://tpc.googlesyndication.com",
];
const ADSENSE_CONNECT = [...ADSENSE_SHARED, "https://googleads.g.doubleclick.net"];
const ADSENSE_FRAMES = [
  "https://googleads.g.doubleclick.net",
  "https://tpc.googlesyndication.com",
  "https://*.adtrafficquality.google",
  "https://www.google.com",
];
const EXTRA_SENSITIVE_ROUTES = ["/r/:path*", "/owner/:path*"] as const;

/** Builds the Content-Security-Policy header string for the given feature flags. */
export function buildContentSecurityPolicy({ adsEnabled, isDev = false }: CspOptions): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    ...(adsEnabled ? ADSENSE_SCRIPTS : []),
  ];
  const imgSrc = ["'self'", "data:", "blob:", ...(adsEnabled ? ADSENSE_IMAGES : [])];
  const connectSrc = ["'self'", ...(adsEnabled ? ADSENSE_CONNECT : [])];
  const frameSrc = adsEnabled ? ADSENSE_FRAMES : ["'none'"];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    `img-src ${imgSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    `frame-src ${frameSrc.join(" ")}`,
  ].join("; ");
}

/** Builds global and sensitive-route HTTP security header rules for Next.js. */
export function buildNextSecurityHeaders(options: CspOptions): NextHeaderRule[] {
  const globalRule: NextHeaderRule = {
    source: "/:path*",
    headers: [
      { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ],
  };

  const sensitiveRules = [...TOKEN_ROUTE_SOURCES, ...EXTRA_SENSITIVE_ROUTES].map((source) => ({
    source,
    headers: TOKEN_HTTP_HEADERS,
  }));

  return [globalRule, ...sensitiveRules];
}
