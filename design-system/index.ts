/**
 * 싱싱골프투어 디자인 시스템 인덱스
 * 
 * @description 모든 디자인 시스템 요소를 중앙에서 관리
 */

// 색상 시스템
export * from './brand-colors';

// 컴포넌트 예시
export * from './examples/header-samples';

// 유틸리티 함수
export const getDocumentHeaderStyle = (documentType: 'contract' | 'operational') => {
  if (documentType === 'contract') {
    return {
      backgroundColor: '#2c5282',
      borderRadius: '0',
      padding: '25px 20px',
    };
  }
  
  return {
    backgroundColor: '#4a6fa5',
    borderRadius: '10px 10px 0 0',
    padding: '20px',
  };
};

// 문서 타입 판별 함수
export const getDocumentType = (documentId: string): 'contract' | 'operational' => {
  const contractDocs = ['customer_schedule'];
  return contractDocs.includes(documentId) ? 'contract' : 'operational';
};

// Tailwind 클래스 헬퍼
export const getHeaderClasses = (documentType: 'contract' | 'operational') => {
  const baseClasses = 'text-white text-center';
  
  if (documentType === 'contract') {
    return `${baseClasses} bg-singsing-dark p-5`;
  }
  
  return `${baseClasses} bg-singsing-main p-5 rounded-t-lg`;
};

// 60대 고객을 위한 텍스트 크기 조정
export const getAccessibleFontSize = (baseSize: number, isElderly: boolean = true) => {
  if (isElderly) {
    return Math.max(16, baseSize + 2);
  }
  return baseSize;
};
