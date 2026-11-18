import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } from "next/constants";
import { buildNextSecurityHeaders } from "./src/infrastructure/security-headers";
import { parseEnv } from "./src/shared/env-schema";

function createNextConfig(phase: string): NextConfig {
  const adsEnabled = process.env.ADS_ENABLED === "true";
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    poweredByHeader: false,
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
      return buildNextSecurityHeaders({ adsEnabled, isDev });
    },
  };
}

export default function configure(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER) {
    parseEnv(process.env);
  }

  return createNextConfig(phase);
}
