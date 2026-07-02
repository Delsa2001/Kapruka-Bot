import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.kapruka.com",    pathname: "/**" },
      { protocol: "https", hostname: "kapruka.com",        pathname: "/**" },
      { protocol: "https", hostname: "static2.kapruka.com", pathname: "/**" },
      // NOTE: wildcard *.kapruka.com removed to prevent SSRF via unknown subdomains
    ],
  },
};

export default nextConfig;
