import type { NextConfig } from "next";

const nextConfig: NextConfig & { agentRules?: boolean } = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: false,
  agentRules: false
};

export default nextConfig;
