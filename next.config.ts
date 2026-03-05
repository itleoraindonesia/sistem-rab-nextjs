import withPWA from "next-pwa";

const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/embed/kalkulator-harga/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

const runtimeCaching = [
  {
    urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: "CacheFirst" as const,
    options: {
      cacheName: "images",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      },
    },
  },
  {
    urlPattern: /^https:\/\/.*\.(?:js|css)$/i,
    handler: "StaleWhileRevalidate" as const,
    options: {
      cacheName: "static-resources",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60,
      },
    },
  },
  {
    urlPattern: /\/api\/.*/i,
    handler: "NetworkFirst" as const,
    options: {
      cacheName: "api-cache",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60,
      },
      networkTimeoutSeconds: 10,
    },
  },
  {
    urlPattern: /\/.*/i,
    handler: "NetworkFirst" as const,
    options: {
      cacheName: "pages",
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60,
      },
      networkTimeoutSeconds: 10,
    },
  },
];

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  dynamicStartUrl: false,
  runtimeCaching,
  fallbacks: {
    document: "/_offline",
    image: "/icon-192x192.png",
    audio: "/icon-192x192.png",
    video: "/icon-192x192.png",
    font: "/icon-192x192.png",
  },
})(nextConfig);
