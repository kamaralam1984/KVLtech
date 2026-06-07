import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────
type RateLimitEntry = { count: number; resetAt: number }

const rateLimitMap = new Map<string, RateLimitEntry>()
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 100
const CLEANUP_INTERVAL = 5 * 60 * 1000

let lastCleanup = Date.now()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
    lastCleanup = now
  }
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_REQUESTS) return false
  entry.count++
  return true
}

// ─────────────────────────────────────────────
// TENANT DETECTION
// ─────────────────────────────────────────────
const MAIN_DOMAIN = "kvlbusinesssolutions.com"
const MAIN_HOSTS = new Set([
  "kvlbusinesssolutions.com",
  "www.kvlbusinesssolutions.com",
  "localhost",
])

function isMainHost(host: string): boolean {
  const bare = host.split(":")[0]
  return MAIN_HOSTS.has(bare)
}

function extractTenantSlug(host: string): string | null {
  const bare = host.split(":")[0]
  if (MAIN_HOSTS.has(bare)) return null
  if (bare.endsWith(`.${MAIN_DOMAIN}`)) {
    const slug = bare.slice(0, bare.length - MAIN_DOMAIN.length - 1)
    return slug || null
  }
  // Custom domain — resolve slug in API layer
  return "__custom__"
}

// ─────────────────────────────────────────────
// PROXY
// ─────────────────────────────────────────────
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rate limiting on all API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": String(MAX_REQUESTS),
            "X-RateLimit-Remaining": "0",
          },
        }
      )
    }
  }

  // Pass pathname to layout via header
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", pathname)

  // Tenant detection from subdomain / custom domain
  const host = req.headers.get("host") || req.headers.get("x-forwarded-host") || ""
  if (host && !isMainHost(host)) {
    const slug = extractTenantSlug(host)
    if (!slug) {
      // Unknown host — redirect to main site
      const mainUrl = new URL(req.url)
      mainUrl.host = MAIN_DOMAIN
      return NextResponse.redirect(mainUrl, 307)
    }
    if (slug === "__custom__") {
      requestHeaders.set("x-tenant-host", host)
    } else {
      requestHeaders.set("x-tenant-slug", slug)
      requestHeaders.set("x-tenant-id", slug)
    }
  }

  // Protect all /admin/* except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("kvl_admin_token")?.value
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If already logged in and visiting /admin/login, redirect to dashboard
  if (pathname === "/admin/login") {
    const token = req.cookies.get("kvl_admin_token")?.value
    if (token) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
}
