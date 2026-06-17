/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }
    ]
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "frame-src 'self' https://gumroad.com https://*.gumroad.com https://gum.co https://*.gum.co",
      "form-action 'self'",
      "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com",
      "font-src 'self' data:",
      `script-src 'self' 'unsafe-inline' https://gumroad.com https://*.gumroad.com https://gum.co https://*.gum.co${isProduction ? "" : " 'unsafe-eval'"}`,
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://api.cloudinary.com https://gumroad.com https://*.gumroad.com https://gum.co https://*.gum.co",
      "manifest-src 'self'",
      "media-src 'self'",
      "worker-src 'self' blob:",
      ...(isProduction ? ["upgrade-insecure-requests"] : [])
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "Content-Security-Policy", value: csp },
          ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : [])
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" }
        ]
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" }
        ]
      }
    ];
  }
};

export default nextConfig;
