import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js badge so the BO2 loading screen stays clean in dev.
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      // Preserve old share links that pointed at the root builder URL.
      {
        source: "/",
        has: [{ type: "query", key: "c" }],
        destination: "/builder",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
