// styles/colors.js - 싱싱골프투어 전용 색상 팔레트

const colors = {
  // Primary Brand Colors (문서 타입별)
  contractDark: '#2c5282',     // 계약 문서용 (진한 파란색, 권위감)
  operationalMain: '#4a6fa5',  // 실행 문서용 (연한 파란색, 친근감)
  accentLight: '#4299e1',      // 강조 요소용 (밝은 파란색)
  backgroundLight: '#e7f3ff',  // 배경색용 (아주 연한 파란색)
  
  // Legacy Colors (기존 시스템 호환)
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
  
  // Status Colors
  success: '#2F855A',          // 성공 (초록)
  warning: '#F59E0B',          // 경고 (주황)
  error: '#E53E3E',            // 에러 (빨강)
  info: '#3182CE',             // 정보 (파랑)
  
  // Timeline Colors (60대 고객 친화적)
  timelineGolf: '#e6f4ea',     // 골프 - 연한 초록
  timelineMeal: '#fdf9f3',     // 식사 - 아주 연한 베이지
  timelineDefault: '#f8f9fa',  // 기본 - 연한 회색
};

// Tailwind Config에서 사용할 색상 맵
const tailwindColors = {
  // New Brand System
  'singsing': {
    'dark': colors.contractDark,
    'main': colors.operationalMain,
    'light': colors.accentLight,
    'lighter': colors.backgroundLight,
  },
  
  // Legacy Primary
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
  
  // Timeline
  'timeline': {
    'golf': colors.timelineGolf,
    'meal': colors.timelineMeal,
    'default': colors.timelineDefault,
  },
};

module.exports = {
  colors,
  tailwindColors
};