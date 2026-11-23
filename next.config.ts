import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // De lettertypes voor de deel-afbeeldingen moeten mee naar de server
  outputFileTracingIncludes: { "/**": ["./assets/fonts/**"] },
  async redirects() {
    return [{ source: "/steden", destination: "/kaart", permanent: true }];
  },
};

export default nextConfig;
