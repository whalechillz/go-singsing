// 관광지 카테고리 정의
export const ATTRACTION_CATEGORIES = {
  tourist_spot: '명소',
  restaurant: '맛집', 
  rest_area: '휴게소',
  activity: '액티비티',
  shopping: '쇼핑'
} as const;

export type AttractionCategory = keyof typeof ATTRACTION_CATEGORIES;

// 네이버 카테고리 매핑 규칙
export const NAVER_CATEGORY_MAPPING = {
  맛집: 'restaurant',
  음식: 'restaurant',
  음식점: 'restaurant',
  카페: 'restaurant',
  휴게소: 'rest_area',
  휴게: 'rest_area',
  쇼핑: 'shopping',
  백화점: 'shopping',
  마트: 'shopping',
  액티비티: 'activity',
  체험: 'activity',
  놀이: 'activity',
  레저: 'activity'
} as const;

// 네이버 카테고리를 시스템 카테고리로 변환하는 함수
export function mapNaverToSystemCategory(naverCategory: string): AttractionCategory {
  if (!naverCategory) return 'tourist_spot';
  
  // 매핑 테이블에서 찾기
  for (const [keyword, category] of Object.entries(NAVER_CATEGORY_MAPPING)) {
    if (naverCategory.includes(keyword)) {
      return category as AttractionCategory;
    }
  }
  
  // 기본값
  return 'tourist_spot';
}
