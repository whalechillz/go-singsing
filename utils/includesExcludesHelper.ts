// utils/includesExcludesHelper.ts
// 기존 시스템과 호환성을 유지하면서 새로운 구조도 지원하는 헬퍼 함수

interface IncludeExcludeItem {
  category: string;
  items: string[];
}

/**
 * 투어 수정시 여행상품 데이터 적용 (호환성 유지)
 */
export function applyProductToTour(product: any, currentForm: any) {
  return {
    ...currentForm,
    accommodation: product.hotel || currentForm.accommodation,
    // includes/included_items 둘 다 확인
    includes: product.includes || product.included_items || currentForm.includes,
    excludes: product.excludes || product.excluded_items || currentForm.excludes,
  };
}

/**
 * 문서 생성시 포함사항 데이터 가져오기
 */
export function getIncludesForDisplay(tourData: any, productData: any): string {
  // 우선순위: 투어 데이터 > 여행상품 데이터
  const includes = tourData.includes || 
                  productData?.includes || 
                  productData?.included_items || 
                  '';
  
  // 이미 문자열이면 그대로 반환
  if (typeof includes === 'string') {
    return includes;
  }
  
  // JSONB/객체인 경우 텍스트로 변환
  if (typeof includes === 'object') {
    try {
      // JSONB 구조인 경우
      if (Array.isArray(includes)) {
        const items: string[] = [];
        includes.forEach((category: any) => {
          if (category.items && Array.isArray(category.items)) {
            items.push(...category.items);
          }
        });
        return items.join('\n');
      }
    } catch (e) {
      console.error('포함사항 파싱 오류:', e);
    }
  }
  
  return '';
}

/**
 * 문서 생성시 불포함사항 데이터 가져오기
 */
export function getExcludesForDisplay(tourData: any, productData: any): string {
  const excludes = tourData.excludes || 
                  productData?.excludes || 
                  productData?.excluded_items || 
                  '';
  
  if (typeof excludes === 'string') {
    return excludes;
  }
  
  if (typeof excludes === 'object') {
    try {
      if (Array.isArray(excludes)) {
        const items: string[] = [];
        excludes.forEach((category: any) => {
          if (category.items && Array.isArray(category.items)) {
            items.push(...category.items);
          }
        });
        return items.join('\n');
      }
    } catch (e) {
      console.error('불포함사항 파싱 오류:', e);
    }
  }
  
  return '';
}