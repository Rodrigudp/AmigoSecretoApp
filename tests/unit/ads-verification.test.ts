import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { metadata } from "../../app/layout";

describe("AdSense site verification", () => {
  it("declares the public publisher in metadata and ads.txt", () => {
    expect(metadata.other?.["google-adsense-account"]).toBe("ca-pub-2752974850416759");
    expect(readFileSync("public/ads.txt", "utf8").replace(/\r\n/g, "\n")).toBe(
      "google.com, pub-2752974850416759, DIRECT, f08c47fec0942fa0\n"
    );
  });
});
