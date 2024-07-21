const path = require("path");

module.exports = async () => {
  const isWeb = process.env.NEXT_PUBLIC_PLATFORM === "web";

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    experimental: {
      outputFileTracingRoot: path.join(__dirname, "../../../"),
    },
    output: isWeb ? "standalone" : "export",
    images: {
      unoptimized: !isWeb,
      remotePatterns: [
        {
          hostname: "images.igdb.com",
          protocol: "https",
        },
      ],
    },
  };

  return nextConfig;
};
