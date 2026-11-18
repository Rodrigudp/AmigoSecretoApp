import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } from "next/constants";
import { parseEnv } from "./src/shared/env-schema";
import { TOKEN_HTTP_HEADERS } from "./app/_lib/token-page-meta";
import { TOKEN_ROUTE_SOURCES } from "./app/_lib/token-paths";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return TOKEN_ROUTE_SOURCES.map((source) => ({
      source,
      headers: TOKEN_HTTP_HEADERS,
    }));
  },
};

export default function configure(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER) {
    parseEnv(process.env);
  }

  return nextConfig;
}
