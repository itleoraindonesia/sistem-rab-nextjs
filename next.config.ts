import withPWA from "next-pwa";

const nextConfig = {
  /* config options here */
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

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})(nextConfig);
