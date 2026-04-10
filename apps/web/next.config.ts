import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".nextbuild",
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
};

export default nextConfig;
