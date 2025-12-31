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
      // ✅ Allow images from Fly.io backend host used in properties (e.g. https://broker-adda-be.fly.dev/uploads/...)
      {
        protocol: 'https',
        hostname: 'broker-adda-be.fly.dev',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'broker-adda-be.fly.dev',
        pathname: '/uploads/images/**',
      },
      {
        protocol: 'https',
        hostname: 'broker-adda.algofolks.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'broker-adda.algofolks.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.investopedia.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
