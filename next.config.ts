// next.config.ts

import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'frontend-take-home.fetch.com',
        pathname: '/dog-images/**',
      },
    ],
  },
};

export default config;