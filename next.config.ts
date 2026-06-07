import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Standalone output for Docker — production only (causes reload loops in dev)
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Disable double-rendering in development
  reactStrictMode: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // Compression
  compress: true,

  // Remove X-Powered-By header
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Cache static assets for 1 year
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Next.js static chunks — immutable forever
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache API responses briefly
        source: "/api/products",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        // No cache for auth/admin APIs
        source: "/api/admin/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ]
  },

  // Redirect www to non-www
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.kvlbusinesssolutions.com" }],
        destination: "https://kvlbusinesssolutions.com/:path*",
        permanent: true,
      },
    ]
  },

  // Heavy server-only packages: exclude from client bundle
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs", "nodemailer", "sharp", "razorpay"],

  // Experimental features
  experimental: {
    optimizeCss: true,
    // Tree-shake large icon/component libraries — only bundle what's imported
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
    ],
  },

  // Webpack bundle optimisation
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        aggregateTimeout: 300,
        ignored: ["**/.git/**", "**/node_modules/**", "**/.next/**"],
      }
    }
    if (!dev && !isServer) {
      config.optimization.concatenateModules = true
    }
    return config
  },
}

// Bundle analyzer — run: ANALYZE=true npm run build
const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@next/bundle-analyzer")({ enabled: true })
    : (config: NextConfig) => config

export default withBundleAnalyzer(nextConfig)
