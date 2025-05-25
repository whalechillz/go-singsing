// styles/fonts.tsx - 싱싱골프투어 전용 폰트 설정

export const fonts = {
  // 메인 한글 폰트 (60대 이상 여성 타겟: 부드럽고 가독성 높은)
  koreanMain: 'Noto Sans KR, sans-serif',
  
  // 영문 서브 폰트 (부드럽고 심플한)
  englishSub: 'Noto Sans, sans-serif',
  
  // 시스템 폴백 폰트
  fallback: '-apple-system, BlinkMacSystemFont, "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif',
};

// 폰트 사이즈 시스템 (60대 이상 가독성 고려)
export const fontSize = {
  // 제목
  h1: 'text-3xl md:text-4xl',       // 32px / 40px
  h2: 'text-2xl md:text-3xl',       // 24px / 32px
  h3: 'text-xl md:text-2xl',        // 20px / 24px
  h4: 'text-lg md:text-xl',         // 18px / 20px
  
  // 본문
  body: 'text-base md:text-lg',     // 16px / 18px (기본)
  small: 'text-sm md:text-base',    // 14px / 16px
  tiny: 'text-xs md:text-sm',       // 12px / 14px
  
  // 버튼/레이블
  button: 'text-base',              // 16px
  label: 'text-sm',                 // 14px
};

// 폰트 굵기
export const fontWeight = {
  normal: 'font-normal',    // 400
  medium: 'font-medium',    // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold',        // 700
};

// 줄간격 (가독성 향상)
export const lineHeight = {
  tight: 'leading-tight',     // 1.25
  normal: 'leading-normal',   // 1.5
  relaxed: 'leading-relaxed', // 1.625
  loose: 'leading-loose',     // 2
};