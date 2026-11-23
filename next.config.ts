import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/steden", destination: "/kaart", permanent: true }];
  },
};

export default nextConfig;
