# 포함/불포함 데이터 구조 가이드

## 개요
투어 관리 시스템의 포함/불포함 사항 데이터 구조를 개선하여 카테고리별로 관리할 수 있도록 변경했습니다.

## 데이터 구조

### 1. 기본 구조 (JSONB)
```json
{
  "includes": [
    {
      "category": "golf",
      "items": ["18홀 그린피", "카트비", "캐디피"]
    },
    {
      "category": "accommodation",
      "items": ["2인 1실 숙박", "조식 포함"]
    }
  ]
}
```

### 2. 카테고리 종류
- `golf`: 골프 관련
- `accommodation`: 숙박 관련
- `transport`: 교통 관련
- `meal`: 식사 관련
- `personal`: 개인 비용
- `other`: 기타

## 사용 위치

### tour_products (여행상품 템플릿)
- `included_items`: 기본 포함사항
- `excluded_items`: 기본 불포함사항
- `accommodation_info`: 숙소 상세정보

### singsing_tours (실제 투어)
- `includes`: 투어별 포함사항 (커스터마이징 가능)
- `excludes`: 투어별 불포함사항 (커스터마이징 가능)
- `accommodation`: 실제 숙소명

## 데이터 흐름

1. **투어 생성시**
   - 여행상품 선택 → 기본값 복사
   - 필요시 투어별로 수정

2. **표시 우선순위**
   - 투어 데이터 > 여행상품 데이터
   - 없으면 빈 배열 `[]`

## API 사용 예시

### 데이터 조회
```typescript
// 투어의 최종 포함사항 조회
const tour = await supabase
  .from('tour_schedule_full_view')
  .select('final_includes, final_excludes')
  .eq('tour_id', tourId)
  .single();
```

### 데이터 저장
```typescript
// 포함사항 업데이트
const { error } = await supabase
  .from('singsing_tours')
  .update({
    includes: [
      {
        category: 'golf',
        items: ['18홀 그린피', '카트비', '캐디피', '연습장 이용']
      }
    ]
  })
  .eq('id', tourId);
```

### 카테고리별 조회
```sql
-- SQL 함수 사용
SELECT get_includes_by_category(includes, 'golf') 
FROM singsing_tours 
WHERE id = 'tour-id';
```

## UI 컴포넌트 사용

```tsx
<IncludesExcludesEditor
  includes={tourData.includes}
  excludes={tourData.excludes}
  onChange={(type, data) => {
    setTourData(prev => ({
      ...prev,
      [type]: data
    }));
  }}
/>
```

## 마이그레이션 상태

- ✅ tour_products 테이블 구조 개선
- ✅ 인덱스 추가
- ⏳ singsing_tours 테이블 JSONB 변환 (다음 단계)
- ⏳ UI 컴포넌트 적용 (다음 단계)

## 주의사항

1. **하위 호환성**: 기존 text 형식도 지원
2. **데이터 무결성**: 마이그레이션 전 백업 필수
3. **점진적 적용**: 한 번에 모든 투어 변경 X