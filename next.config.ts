import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile and LAN devices to connect to Next.js dev server without cross-origin warnings
  allowedDevOrigins: [
    "172.22.5.127",
    "192.168.137.1",
    "localhost",
    "127.0.0.1",
    "*.local"
  ],

  // ═══════════════════════════════════════════════════════
  // IMAGE OPTIMIZATION
  // Whitelist external image domains for next/image
  // ═══════════════════════════════════════════════════════
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // Cache optimized images for 1 year
    remotePatterns: [
      {
        // Supabase Storage (all projects & buckets)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/**",
      },
      {
        // Google Cloud Storage (photos, videos, GIFs)
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**",
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
            value: "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
