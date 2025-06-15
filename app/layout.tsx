import "./globals.css";
import type { Metadata } from "next";
import KakaoInit from "@/components/KakaoInit";

export const metadata: Metadata = {
  title: "싱싱골프투어 - Premium Golf Tour",
  description: "고품격 골프 여행의 시작, 싱싱골프투어가 함께합니다",
  icons: {
    icon: [
      { url: "/singsing_logo.svg", type: "image/svg+xml" },
      { url: "/singsing_logo_192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/singsing_logo_180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "싱싱골프투어 - Premium Golf Tour",
    description: "고품격 골프 여행의 시작, 싱싱골프투어가 함께합니다",
    siteName: "싱싱골프투어",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/singsing_logo_192x192.png",
        width: 192,
        height: 192,
        alt: "싱싱골프투어 로고",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "싱싱골프투어 - Premium Golf Tour",
    description: "고품격 골프 여행의 시작, 싱싱골프투어가 함께합니다",
    images: ["/singsing_logo_192x192.png"],
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
        {/* PWA 및 파비콘 추가 설정 */}
        <meta name="theme-color" content="#003366" />
        <link rel="apple-touch-icon" href="/singsing_logo_180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/singsing_logo_192x192.png" />
        <link rel="mask-icon" href="/singsing_logo.svg" color="#003366" />
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}