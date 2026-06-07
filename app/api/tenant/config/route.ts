import { NextRequest, NextResponse } from "next/server";
import { resolveTenant, ensureTenantsLoaded } from "@/lib/tenant";

// PUBLIC — returns tenant branding for current host
// The middleware sets X-Tenant-Slug; this route reads it
// (fallback: read host directly)
export async function GET(req: NextRequest) {
  await ensureTenantsLoaded();

  // First try header set by middleware
  const slugFromHeader = req.headers.get("x-tenant-slug");
  const host = req.headers.get("host") || "";

  let tenant = slugFromHeader
    ? null // will resolve below
    : resolveTenant(host);

  if (slugFromHeader && !tenant) {
    // resolve via host (middleware already set the header, trust the host)
    tenant = resolveTenant(host);
  }

  if (!tenant) {
    // Main domain — no tenant context
    return NextResponse.json({ tenant: null });
  }

  // Return only the public-safe fields
  return NextResponse.json({
    tenant: {
      name: tenant.name,
      logoUrl: tenant.logoUrl ?? null,
      primaryColor: tenant.primaryColor,
      slug: tenant.slug,
    },
  });
}
