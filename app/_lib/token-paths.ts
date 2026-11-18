/** Sources used by next.config.ts headers() for token-bearing routes (grupos.md §6.2). */
export const TOKEN_ROUTE_SOURCES = [
  "/g/:path*",
  "/p/:path*",
  "/admin/:path*",
  "/api/p/hs/:path*",
] as const;
