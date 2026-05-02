import type { NextConfig } from "next";

const nextConfig: NextConfig & { agentRules?: boolean } = {
  reactStrictMode: true,
  typedRoutes: false,
  agentRules: false
};

export default nextConfig;
