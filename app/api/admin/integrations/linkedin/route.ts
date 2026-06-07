import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getLinkedInAdStats,
  getLinkedInOrganizationFollowers,
  getLinkedInRecentPosts,
  integrationConfigStore,
} from "@/lib/integrations-extended";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cfg = integrationConfigStore.get("linkedin");
  const accessToken = cfg?.config?.LINKEDIN_ACCESS_TOKEN || process.env.LINKEDIN_ACCESS_TOKEN || "";
  const orgId = cfg?.config?.LINKEDIN_ORG_ID || process.env.LINKEDIN_ORG_ID || "";

  if (!accessToken || !orgId) {
    return NextResponse.json(
      { error: "LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORG_ID not configured" },
      { status: 400 }
    );
  }

  try {
    const [adStats, followers, recentPosts] = await Promise.all([
      getLinkedInAdStats(accessToken, orgId).catch(() => null),
      getLinkedInOrganizationFollowers(accessToken, orgId),
      getLinkedInRecentPosts(accessToken, orgId),
    ]);

    return NextResponse.json({ adStats, followers, recentPosts });
  } catch (err) {
    console.error("[LinkedIn]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
