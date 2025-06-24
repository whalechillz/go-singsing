'use client';

import { useEffect } from 'react';

export default function KakaoInit() {
  useEffect(() => {
    // 카카오 SDK 초기화
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
      if (kakaoKey) {
        window.Kakao.init(kakaoKey);
        console.log('Kakao SDK initialized');
      } else {
        console.warn('Kakao App Key not found in environment variables');
      }
    }
  }, []);

  return null;
}

// Window 타입 확장
declare global {
  interface Window {
    Kakao: any;
  }
}
