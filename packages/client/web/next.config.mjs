/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.igdb.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
