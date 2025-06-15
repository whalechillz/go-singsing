import "./globals.css";
import type { Metadata } from "next";
import KakaoInit from "@/components/KakaoInit";

export const metadata: Metadata = {
  title: "싱싱골프투어 - Premium Golf Tour",
  description: "고품격 골프 여행의 시작, 싱싱골프투어가 함께합니다",
  icons: {
    icon: [
      { url: "/singsing_logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/singsing_logo.svg" },
    ],
  },
  openGraph: {
    title: "싱싱골프투어 - Premium Golf Tour",
    description: "고품격 골프 여행의 시작, 싱싱골프투어가 함께합니다",
    siteName: "싱싱골프투어",
    locale: "ko_KR",
    type: "website",
  },
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