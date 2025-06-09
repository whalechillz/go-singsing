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
  // 개발 환경에서 소스맵 관련 404 에러 방지
  productionBrowserSourceMaps: false,
};

export default nextConfig;
