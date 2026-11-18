import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const isIntegrationRun = process.argv.some((arg) =>
  arg.replace(/\\/g, "/").includes("tests/integration")
);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: isIntegrationRun
      ? ["tests/integration/**/*.{test,spec}.{ts,tsx}"]
      : ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    exclude: isIntegrationRun ? [] : ["tests/integration/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
});
