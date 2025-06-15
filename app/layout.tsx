import "./globals.css";
import type { Metadata } from "next";
import KakaoInit from "@/components/KakaoInit";

export const metadata: Metadata = {
  metadataBase: new URL('https://go.singsinggolf.kr'),
  title: "싱싱골프투어 | 2박3일 골프패키지 전문 리무진버스 단체투어",
  description: "국내 골프여행 전문, 리무진버스 단체투어, 2박3일 골프패키지, 기사·가이드 동행, 맞춤 일정, 전화예약 031-215-3990",
  keywords: "골프투어, 골프여행, 2박3일 골프패키지, 단체골프, 리무진버스, 골프버스투어, 국내골프투어, 골프패키지여행, 싱싱골프투어",
  manifest: "/manifest.json",
  openGraph: {
    title: "싱싱골프투어 | 2박3일 골프패키지 리무진버스 단체투어",
    description: "✅ 리무진버스 이동 ✅ 2박3일 골프패키지 ✅ 전문 기사·가이드 ✅ 맞춤 일정 ✅ 단체 할인 | 전화예약 031-215-3990",
    siteName: "싱싱골프투어",
    locale: "ko_KR",
    type: "website",
    url: "https://go.singsinggolf.kr",
    images: [
      {
        url: "/favicon/singsing_logo_192x192.png",
        width: 192,
        height: 192,
        alt: "싱싱골프투어 로고 - 국내 골프여행 전문",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "싱싱골프투어 | 2박3일 골프패키지 리무진버스 단체투어",
    description: "국내 골프여행 전문 🚌 리무진버스 이동 ⛳ 2박3일 골프패키지 📞 031-215-3990",
    images: ["/favicon/singsing_logo_192x192.png"],
  },
  alternates: {
    canonical: "https://go.singsinggolf.kr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // 추후 Google Search Console 인증 코드 추가
    other: {
      "naver-site-verification": "naver-site-verification-code", // 추후 네이버 웹마스터도구 인증 코드 추가
    },
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
        {/* PWA 및 테마 설정 */}
        <meta name="theme-color" content="#003366" />
        <link rel="mask-icon" href="/singsing_logo.svg" color="#003366" />
        {/* 구조화 데이터 (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "싱싱골프투어",
              "description": "국내 골프여행 전문, 2박3일 골프패키지, 리무진버스 단체투어",
              "url": "https://go.singsinggolf.kr",
              "telephone": "031-215-3990",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "KR",
                "addressRegion": "경기도"
              },
              "priceRange": "$$",
              "openingHours": "Mo-Fr 09:00-18:00",
              "sameAs": [
                "https://blog.naver.com/singsinggolf"
              ],
              "makesOffer": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "TravelAction",
                    "name": "2박3일 골프패키지",
                    "description": "리무진버스 이동, 숙박/식사 포함, 전문 기사·가이드 동행"
                  }
                }
              ]
            }),
          }}
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