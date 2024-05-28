module.exports = async () => {
  const isProd = process.env.NODE_ENV === "production";
  const isWeb = process.env.PLATFORM === "web";

  let internalHost = null;

  if (!isProd) {
    const { internalIpV4 } = await import("internal-ip");
    internalHost = await internalIpV4();
  }

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

    assetPrefix: isProd || isWeb ? undefined : `http://${internalHost}:3000`,
  };

  return nextConfig;
};
