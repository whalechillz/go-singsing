/**
 * 싱싱골프투어 브랜드 컬러 시스템
 * 
 * @description 문서 타입, 사용자, 플랫폼별 색상 정의
 * @author MASLABS
 * @version 1.0.0
 * @lastUpdated 2025-01-09
 */

// 기본 브랜드 색상
export const BRAND_COLORS = {
  // Primary Colors
  primary: {
    dark: '#2c5282',    // 계약 문서용 (진한 파란색)
    main: '#4a6fa5',    // 실행 문서용 (연한 파란색)
    light: '#4299e1',   // 강조 요소용 (밝은 파란색)
    lighter: '#e7f3ff', // 배경색용 (아주 연한 파란색)
  },

  // Semantic Colors
  semantic: {
    success: '#2F855A',
    warning: '#F59E0B',
    error: '#E53E3E',
    info: '#3182CE',
  },

  // Neutral Colors
  neutral: {
    black: '#1A202C',
    gray900: '#2D3748',
    gray700: '#4A5568',
    gray500: '#718096',
    gray300: '#CBD5E0',
    gray100: '#F7FAFC',
    white: '#FFFFFF',
  },

  // Background Colors
  background: {
    primary: '#F5F7FA',
    secondary: '#F8F9FA',
    paper: '#FFFFFF',
  },
} as const;

// 문서 타입별 색상 매핑
export const DOCUMENT_COLOR_SCHEME = {
  // A그룹: 계약 단계 문서
  contractual: {
    header: BRAND_COLORS.primary.dark,
    border: BRAND_COLORS.primary.dark,
    accent: BRAND_COLORS.primary.light,
    text: BRAND_COLORS.neutral.white,
  },

  // B그룹: 실행 단계 문서
  operational: {
    header: BRAND_COLORS.primary.main,
    border: BRAND_COLORS.primary.main,
    accent: BRAND_COLORS.primary.light,
    text: BRAND_COLORS.neutral.white,
  },
} as const;

// 사용자별 색상 가이드
export const USER_COLOR_GUIDE = {
  customer: {
    primary: BRAND_COLORS.primary.main,
    secondary: BRAND_COLORS.primary.light,
    background: BRAND_COLORS.background.primary,
  },
  staff: {
    primary: BRAND_COLORS.primary.dark,
    secondary: BRAND_COLORS.neutral.gray700,
    background: BRAND_COLORS.background.secondary,
  },
} as const;

// 플랫폼별 색상 조정
export const PLATFORM_COLORS = {
  print: {
    // 인쇄용은 채도를 약간 높임
    primary: '#2c5282',
    contrast: '#000000',
  },
  digital: {
    // 디지털은 원래 색상 사용
    primary: BRAND_COLORS.primary.main,
    hover: BRAND_COLORS.primary.light,
  },
  mobile: {
    // 모바일은 터치 영역 고려
    primary: BRAND_COLORS.primary.main,
    touchTarget: BRAND_COLORS.primary.lighter,
  },
} as const;

// 60대 고객을 위한 접근성 색상
export const ACCESSIBILITY_COLORS = {
  highContrast: {
    text: '#1A202C',
    background: '#FFFFFF',
    link: '#2563EB',
  },
  largeText: {
    primary: BRAND_COLORS.primary.dark,
    secondary: BRAND_COLORS.neutral.gray900,
  },
} as const;
