import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════
  // IMAGE OPTIMIZATION
  // Whitelist external image domains for next/image
  // ═══════════════════════════════════════════════════════
  images: {
    remotePatterns: [
      {
        // Supabase Storage (gallery uploads, news images)
        protocol: "https",
        hostname: "hfheuhivhwooaobgjtqv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Google Cloud Storage (photos, videos, GIFs)
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // CUSTOM HEADERS
  // Cache + Security headers for performance & protection
  // ═══════════════════════════════════════════════════════
  async headers() {
    return [
      {
        // Static assets: aggressive caching (1 year, immutable)
        source: "/:path*.(ico|jpg|jpeg|png|gif|svg|webp|avif|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // JS/CSS bundles: cache for 1 year (hashed filenames)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Security headers for all routes
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
