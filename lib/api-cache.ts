import { NextResponse } from "next/server"

/**
 * Return a JSON response with public CDN caching headers.
 * Ideal for read-only public API endpoints (products, blog, KB, portfolio).
 */
export function cachedResponse(data: unknown, ttlSeconds: number) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`,
      "Vary": "Accept-Encoding",
    },
  })
}

/**
 * Return a JSON response that must never be cached.
 * Ideal for write operations or sensitive data (auth, admin mutations).
 */
export function noCacheResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}

/**
 * Return a JSON response with private caching headers.
 * Ideal for authenticated user-specific data (profile, orders, tickets).
 */
export function privateResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-cache",
    },
  })
}
