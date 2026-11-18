import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET as getAssetLinks, getAssetLinksConfig } from "@/app/.well-known/assetlinks.json/route";
import { GET as getAasa, getAasaConfig } from "@/app/.well-known/apple-app-site-association/route";

describe("Deep Linking & App Verification Routes (APP-OPS-01)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Android App Links (/.well-known/assetlinks.json)", () => {
    it("responds with HTTP 200, application/json content-type, and caching headers", async () => {
      const response = await getAssetLinks();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("application/json");
      expect(response.headers.get("Cache-Control")).toContain("public");

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0].relation).toContain("delegate_permission/common.handle_all_urls");
      expect(data[0].target.namespace).toBe("android_app");
      expect(data[0].target.package_name).toBe("app.papelzinho");
      expect(Array.isArray(data[0].target.sha256_cert_fingerprints)).toBe(true);
      expect(data[0].target.sha256_cert_fingerprints.length).toBeGreaterThan(0);
    });

    it("respects custom ANDROID_PACKAGE_NAME environment variable", () => {
      process.env.ANDROID_PACKAGE_NAME = "custom.package.id";
      const config = getAssetLinksConfig();
      expect(config[0].target.package_name).toBe("custom.package.id");
    });

    it("parses comma-separated ANDROID_SHA256_FINGERPRINTS", () => {
      process.env.ANDROID_SHA256_FINGERPRINTS = "AA:BB:CC, DD:EE:FF";
      const config = getAssetLinksConfig();
      expect(config[0].target.sha256_cert_fingerprints).toEqual(["AA:BB:CC", "DD:EE:FF"]);
    });

    it("parses JSON array in ANDROID_SHA256_FINGERPRINTS", () => {
      process.env.ANDROID_SHA256_FINGERPRINTS = JSON.stringify(["11:22:33", "44:55:66"]);
      const config = getAssetLinksConfig();
      expect(config[0].target.sha256_cert_fingerprints).toEqual(["11:22:33", "44:55:66"]);
    });
  });

  describe("iOS Universal Links (/.well-known/apple-app-site-association)", () => {
    it("responds with HTTP 200, application/json content-type, and valid AASA structure", async () => {
      const response = await getAasa();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("application/json");
      expect(response.headers.get("Cache-Control")).toContain("public");

      const data = await response.json();
      expect(data.applinks).toBeDefined();
      expect(Array.isArray(data.applinks.details)).toBe(true);

      const detail = data.applinks.details[0];
      expect(detail.appID).toBe("TEAMID1234.app.papelzinho");
      expect(detail.paths).toEqual(["/g/*", "/p/*", "/admin/*"]);
      expect(data.webcredentials?.apps).toContain("TEAMID1234.app.papelzinho");
    });

    it("respects custom APPLE_TEAM_ID and APPLE_BUNDLE_ID environment variables", () => {
      process.env.APPLE_TEAM_ID = "ABCDE12345";
      process.env.APPLE_BUNDLE_ID = "com.custom.app";
      const config = getAasaConfig();
      expect(config.applinks.details[0].appID).toBe("ABCDE12345.com.custom.app");
      expect(config.webcredentials?.apps).toEqual(["ABCDE12345.com.custom.app"]);
    });

    it("maps essential path patterns for groups, participants, and admin", () => {
      const config = getAasaConfig();
      const paths = config.applinks.details[0].paths;
      expect(paths).toContain("/g/*");
      expect(paths).toContain("/p/*");
      expect(paths).toContain("/admin/*");
    });
  });
});
