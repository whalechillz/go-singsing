// styles/colors.js - 싱싱골프투어 전용 색상 팔레트

const colors = {
  // Primary Colors
  brand: '#34699C',            // 메인 네이비 (신뢰/고급)
  accent: '#FFC107',           // 골드 포인트 (VIP/고급 강조)
  secondary: '#66B3E3',        // 서브 블루 (편안함/모던)
  nature: '#7BC4A2',           // 자연 그린 (힐링/자연)
  
  // Text Colors
  textPrimary: '#2D3748',      // 메인 텍스트 다크그레이
  textSecondary: '#4A5568',    // 서브 텍스트 연한 다크그레이
  textMuted: '#718096',        // 보조 텍스트
  disabledText: '#A0AEC0',     // 비활성 텍스트
  
  // Background Colors
  backgroundPrimary: '#FFFFFF',     // 기본 흰 배경
  backgroundSecondary: '#F8F9FA',   // 연회색 배경 (섹션용)
  backgroundSoft: '#F5F8FA',        // 아주 연한 블루 배경
  
  // Border & Divider
  borderGray: '#E9ECEF',       // 기본 테두리
  borderLight: '#E2E8F0',      // 연한 테두리
  dividerGray: '#DEE2E6',      // 구분선 디바이더
  
  // Status Colors (기존 시스템과 호환)
  success: '#7BC4A2',          // 성공 (nature 색상 재사용)
  warning: '#FFC107',          // 경고 (accent 색상 재사용)
  error: '#E53E3E',            // 에러
  info: '#66B3E3',             // 정보 (secondary 색상 재사용)
};

// Tailwind Config에서 사용할 색상 맵
const tailwindColors = {
  // Primary
  'singsing-brand': colors.brand,
  'singsing-accent': colors.accent,
  'singsing-secondary': colors.secondary,
  'singsing-nature': colors.nature,
  
  // Text
  'singsing-text': colors.textPrimary,
  'singsing-text-secondary': colors.textSecondary,
  'singsing-text-muted': colors.textMuted,
  
  // Background
  'singsing-bg-soft': colors.backgroundSoft,
  'singsing-bg-secondary': colors.backgroundSecondary,
  
  // Border
  'singsing-border': colors.borderGray,
  'singsing-border-light': colors.borderLight,
};

module.exports = {
  colors,
  tailwindColors
};