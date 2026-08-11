import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js badge so the BO2 loading screen stays clean in dev.
  devIndicators: false,
};

export default nextConfig;
