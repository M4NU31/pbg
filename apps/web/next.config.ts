import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".nextbuild",
  serverExternalPackages: ["puppeteer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
