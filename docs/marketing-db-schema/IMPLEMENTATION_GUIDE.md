# 마케팅 콘텐츠 DB 관리 시스템 구현 가이드

## 📋 개요
싱싱골프 마케팅 페이지와 실무 페이지의 포함사항/불포함사항/특별혜택을 구분하여 관리하는 시스템입니다.

## 🎯 목표
- 마케팅용 콘텐츠와 실무용 콘텐츠 분리
- 이쁜 디자인 요소(아이콘, 강조 등) DB 관리
- 템플릿 시스템으로 빠른 콘텐츠 생성
- 투어별/상품별 커스터마이징 가능

## 📊 DB 구조

### 1. 별도 테이블 방식 (추천)
```sql
marketing_contents
├── id (uuid)
├── tour_product_id (uuid) - 상품 기본값
├── tour_id (uuid) - 투어별 커스터마이징
├── content_type (varchar) - 'included', 'excluded', 'special_benefit'
├── display_order (integer) - 표시 순서
├── icon (varchar) - 이모지 아이콘
├── title (text) - 제목
├── description (text) - 설명
├── sub_items (jsonb) - 세부 항목들
├── highlight (boolean) - 강조 여부
└── is_active (boolean) - 활성화 여부

marketing_templates
├── id (uuid)
├── name (varchar) - 템플릿 이름
├── category (varchar) - 카테고리
├── content_type (varchar)
├── icon (varchar)
├── title (text)
├── description (text)
└── sub_items (jsonb)
```

### 2. 기존 테이블 확장 방식 (간단)
```sql
-- tour_products / singsing_tours 테이블에 추가
├── marketing_included_items (jsonb)
├── marketing_excluded_items (jsonb)
└── marketing_special_benefits (jsonb)
```

## 🔧 구현 단계

### 1단계: DB 마이그레이션
```bash
# 마이그레이션 파일 실행
psql -U postgres -d your_database < marketing-data-schema.sql
```

### 2단계: Supabase 타입 생성
```typescript
// types/marketing.ts
export interface MarketingContent {
  id?: string;
  tour_product_id?: string;
  tour_id?: string;
  content_type: 'included' | 'excluded' | 'special_benefit';
  display_order: number;
  icon: string;
  title: string;
  description: string;
  sub_items?: string[];
  highlight?: boolean;
  is_active: boolean;
}
```

### 3단계: API 함수 구현
```typescript
// lib/marketing-content.ts
export async function getMarketingContents(tourId?: string, productId?: string) {
  const { data, error } = await supabase
    .from('marketing_contents')
    .select('*')
    .or(`tour_id.eq.${tourId},tour_product_id.eq.${productId}`)
    .order('content_type', { ascending: true })
    .order('display_order', { ascending: true });
    
  return { data, error };
}

export async function upsertMarketingContent(content: MarketingContent) {
  const { data, error } = await supabase
    .from('marketing_contents')
    .upsert(content);
    
  return { data, error };
}
```

### 4단계: 관리자 페이지 통합
```typescript
// app/admin/tours/[id]/edit/page.tsx
import MarketingContentManager from '@/components/MarketingContentManager';

export default function EditTourPage({ params }) {
  return (
    <div>
      {/* 기존 투어 편집 폼 */}
      
      {/* 마케팅 콘텐츠 관리 섹션 추가 */}
      <MarketingContentManager 
        tourId={params.id}
        tourProductId={tour.tour_product_id}
      />
    </div>
  );
}
```

### 5단계: 마케팅 페이지 표시
```typescript
// components/TourMarketingInfo.tsx
export default function TourMarketingInfo({ tourId }) {
  const [contents, setContents] = useState<MarketingContent[]>([]);
  
  useEffect(() => {
    // 마케팅 콘텐츠 불러오기
    loadMarketingContents();
  }, [tourId]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 포함사항 */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">✅ 포함사항</h3>
        {renderContents('included')}
      </div>
      
      {/* 특별혜택 */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">🎁 특별혜택</h3>
        {renderContents('special_benefit')}
      </div>
      
      {/* 불포함사항 */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">❌ 불포함사항</h3>
        {renderContents('excluded')}
      </div>
    </div>
  );
}
```

## 💡 활용 시나리오

### 1. 상품 기본값 설정
투어 상품(tour_products)에 기본 마케팅 콘텐츠 설정
- 영덕 풀패키지는 기본적으로 "리조트 숙박", "그린피 포함" 등

### 2. 투어별 커스터마이징
특정 투어에서 추가/수정
- "단독투어" 투어는 "단독 투어 특전" 추가
- "시니어 특별 할인" 같은 특별혜택 추가

### 3. 템플릿 활용
자주 사용하는 항목은 템플릿으로 저장
- 클릭 한 번으로 추가
- 일관성 있는 콘텐츠 관리

## 🎨 디자인 포인트

### 아이콘 시스템
- 이모지 사용으로 별도 아이콘 파일 불필요
- 카테고리별 추천 아이콘 제공

### 강조 표시
- highlight 필드로 HOT, NEW 등 뱃지 표시
- 중요 항목 시각적 강조

### 순서 관리
- display_order로 드래그앤드롭 정렬 가능
- 중요도에 따른 배치

## 📱 반응형 디자인
- 모바일: 세로 1열
- 태블릿: 2열
- 데스크탑: 3열 (포함/특별/불포함)

## 🔄 마이그레이션 전략

### 기존 데이터 변환
```sql
-- 기존 text 데이터를 신규 구조로 변환
INSERT INTO marketing_contents (tour_product_id, content_type, title, description)
SELECT 
  id,
  'included',
  '포함사항',
  included_items
FROM tour_products
WHERE included_items IS NOT NULL;
```

### 점진적 적용
1. 신규 투어부터 새 시스템 적용
2. 기존 투어는 순차적으로 마이그레이션
3. 완료 후 기존 필드 제거

## 🚀 추가 개선 아이디어

1. **다국어 지원**
   - 영어/중국어 마케팅 콘텐츠 관리

2. **A/B 테스팅**
   - 다른 버전의 마케팅 콘텐츠 테스트

3. **분석 기능**
   - 어떤 특별혜택이 전환율이 높은지 추적

4. **AI 추천**
   - 투어 특성에 맞는 마케팅 문구 자동 생성
