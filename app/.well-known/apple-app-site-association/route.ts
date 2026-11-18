import { NextResponse } from "next/server";

export interface AppleAppSiteAssociation {
  applinks: {
    apps: string[];
    details: Array<{
      appID: string;
      paths: string[];
      components?: Array<{
        "/": string;
        comment?: string;
      }>;
    }>;
  };
  webcredentials?: {
    apps: string[];
  };
}

const DEFAULT_APPLE_TEAM_ID = "TEAMID1234";
const DEFAULT_APPLE_BUNDLE_ID = "app.papelzinho";

export function getAasaConfig(): AppleAppSiteAssociation {
  const teamId = process.env.APPLE_TEAM_ID || DEFAULT_APPLE_TEAM_ID;
  const bundleId = process.env.APPLE_BUNDLE_ID || DEFAULT_APPLE_BUNDLE_ID;
  const appID = `${teamId}.${bundleId}`;

  return {
    applinks: {
      apps: [],
      details: [
        {
          appID,
          paths: ["/g/*", "/p/*", "/admin/*"],
          components: [
            {
              "/": "/g/*",
              comment: "Group invitation & share link",
            },
            {
              "/": "/p/*",
              comment: "Participant space link",
            },
            {
              "/": "/admin/*",
              comment: "Organizer admin link",
            },
          ],
        },
      ],
    },
    webcredentials: {
      apps: [appID],
    },
  };
}

export async function GET() {
  const data = getAasaConfig();
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
