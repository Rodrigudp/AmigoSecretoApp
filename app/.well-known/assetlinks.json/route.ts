import { NextResponse } from "next/server";

export interface AndroidAssetLink {
  relation: string[];
  target: {
    namespace: string;
    package_name: string;
    sha256_cert_fingerprints: string[];
  };
}

const DEFAULT_ANDROID_PACKAGE_NAME = "app.papelzinho";
// Fallback placeholder fingerprint until the production signing key is generated in Google Play Console
const DEFAULT_FINGERPRINTS = [
  "14:6D:E9:01:C3:59:E0:4E:86:11:A6:04:07:04:30:E8:B3:C6:B6:40:51:37:E2:D6:07:08:F3:36:F7:88:83:CB",
];

export function getAssetLinksConfig(): AndroidAssetLink[] {
  const packageName = process.env.ANDROID_PACKAGE_NAME || DEFAULT_ANDROID_PACKAGE_NAME;
  const rawFingerprints = process.env.ANDROID_SHA256_FINGERPRINTS;

  let fingerprints: string[];
  if (rawFingerprints) {
    try {
      const parsed = JSON.parse(rawFingerprints);
      fingerprints = Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
    } catch {
      fingerprints = rawFingerprints
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  } else {
    fingerprints = DEFAULT_FINGERPRINTS;
  }

  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];
}

export async function GET() {
  const data = getAssetLinksConfig();
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
