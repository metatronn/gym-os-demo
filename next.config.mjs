/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com", // Clerk user avatars
      },
    ],
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      ...config.infrastructureLogging,
      level: "error",
    };
    return config;
  },
};

export default nextConfig;
