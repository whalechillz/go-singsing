// 카카오톡 공유 유틸리티

interface KakaoShareOptions {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
}

// 카카오 SDK 초기화 (app/layout.tsx에서 호출)
export const initKakao = () => {
  if (typeof window !== 'undefined' && !window.Kakao?.isInitialized()) {
    // 카카오 앱 키는 환경변수로 관리하세요
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (kakaoKey) {
      window.Kakao?.init(kakaoKey);
    }
  }
};

// 카카오톡 공유하기
export const shareKakao = (options: KakaoShareOptions) => {
  if (typeof window === 'undefined' || !window.Kakao) {
    console.error('Kakao SDK not loaded');
    return false;
  }

  try {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: options.title,
        description: options.description,
        imageUrl: options.imageUrl || 'https://go.singsinggolf.kr/logo.png',
        link: {
          mobileWebUrl: options.link,
          webUrl: options.link,
        },
      },
      buttons: [
        {
          title: '웹으로 보기',
          link: {
            mobileWebUrl: options.link,
            webUrl: options.link,
          },
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Kakao share error:', error);
    return false;
  }
};

// 카카오톡 설치 여부 확인
export const isKakaoTalkInstalled = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
  
  // 모바일이 아니면 false
  if (!isAndroid && !isIOS) return false;
  
  // 카카오톡 앱 스킴으로 확인 (실제로는 정확하지 않을 수 있음)
  return true; // 모바일이면 대부분 카카오톡이 설치되어 있다고 가정
};

// 카카오톡 공유 URL 생성 (SDK 없이 사용)
export const getKakaoShareUrl = (options: KakaoShareOptions) => {
  const baseUrl = 'https://sharer.kakao.com/talk/friends/picker/link';
  const params = new URLSearchParams({
    app_key: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '',
    app_ver: '1.0',
    title: options.title,
    description: options.description,
    image_url: options.imageUrl || '',
    link_url: options.link,
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Window 타입 확장
declare global {
  interface Window {
    Kakao: any;
  }
}
