import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 타입 체크를 무시하지 않고 진행
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 빌드에서 제외할 파일 패턴
  experimental: {
    turbo: {
      rules: {
        '*.tsx': {
          loaders: ['tsx'],
          as: '*.tsx',
        },
      },
    },
  },
  webpack: (config) => {
    // backup 폴더 제외
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      exclude: /backup/,
    });
    return config;
  },
};

export default nextConfig;