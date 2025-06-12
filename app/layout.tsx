import "./globals.css";
import type { Metadata } from "next";
import KakaoInit from "@/components/KakaoInit";

export const metadata: Metadata = {
  title: "싱싱골프투어",
  description: "싱싱골프투어 관리 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* 카카오 SDK */}
        <script 
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4" 
          crossOrigin="anonymous"
          async
        />
      </head>
      <body className="font-sans antialiased">
        <KakaoInit />
        {children}
      </body>
    </html>
  );
}