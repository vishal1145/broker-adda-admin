import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.w3schools.com',
        pathname: '/howto/**',
      },
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't4.ftcdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
      // ✅ The important part (new domain)
      {
        protocol: 'http',
        hostname: 'broker-adda-be.algofolks.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'broker-adda-be.algofolks.com',
        pathname: '/uploads/images/**',
      },
    ],
  },
};

export default nextConfig;
