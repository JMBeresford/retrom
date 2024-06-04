module.exports = async () => {
  const isWeb = process.env.NEXT_PUBLIC_PLATFORM === "web";

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: isWeb ? undefined : "export",
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
