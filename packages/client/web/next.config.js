const path = require("path");

module.exports = async () => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    experimental: {
      outputFileTracingRoot: path.join(__dirname, "../../../"),
    },
    output: "standalone",
    images: {
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
