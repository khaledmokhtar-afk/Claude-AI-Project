import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@iesl/ai", "@iesl/data", "@iesl/ui"],
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default config;
