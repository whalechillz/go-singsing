# 싱싱골프 마케팅 콘텐츠 DB 적용 가이드

## 🚀 빠른 시작

### 1. SQL 쿼리 실행 순서

1. **테이블 생성** (최초 1회만)
   - 파일: `/supabase/marketing_content_tables.sql`
   - Supabase SQL Editor에서 실행

2. **실제 데이터 입력**
   - 파일: `/supabase/marketing_content_real_data.sql`
   - Supabase SQL Editor에서 실행

### 2. 실행 방법

```bash
# Supabase Dashboard 접속
1. https://app.supabase.com 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭
4. SQL 파일 내용 복사 → 붙여넣기 → Run
```

## 📋 적용된 내용

### 포함사항
- ✅ **리무진 버스** - 28인승 최고급 차량
- ✅ **그린피 및 카트비** - 18홀 × 3일
- ✅ **호텔 2박** - 2인 1실 기준
- ✅ **식사 제공** - 조식 2회, 중식 3회, 석식 2회 (골프텔 또는 5성급 호텔)
- ✅ **전문 기사** - 경험 많은 전문 기사 (가이드 포함 가능)

### 특별 혜택
- ⭐ **지역 맛집 투어** [옵션] - 엄선된 맛집 방문 (선택사항)
- ⭐ **그룹 사진 촬영** [무료] - 기사 또는 가이드가 촬영 서비스 제공
- ⭐ **생수 제공** [기본제공] - 버스 내 생수 상시 제공
- ⭐ **와인 제공** [특별제공] - 저녁 식사 시 와인 제공

### 불포함사항
- ⚠️ **캐디피** - 별도
- ⚠️ **맛집투어 식사비용** - 외부 맛집 이용시 차량 제공, 식사비용은 개인 부담
- ⚠️ **개인 경비** - 기타 개인 비용

## 🔧 관리 방법

### 1. 관리자 페이지에서 수정
```tsx
// 투어 수정 페이지에 마케팅 탭 추가
import MarketingContentManager from '@/components/admin/MarketingContentManager';

// 투어별 개별 설정
<MarketingContentManager
  tourId={tourId}
  tourProductId={tourProductId}
  contentType="tour_specific"
/>
```

### 2. 마케팅 페이지에 표시
```tsx
// 마케팅 페이지 컴포넌트
import { TourMarketingSection } from '@/components/marketing/SingSingMarketingDisplay';

// 사용 예시
<TourMarketingSection 
  tourId={tourId} 
  tourProductId={tourProductId} 
/>
```

## 📊 데이터 구조

### marketing_contents (마스터)
- `tour_product_id`: 투어 상품 연결
- `tour_id`: 개별 투어 연결  
- `content_type`: 'tour_product' | 'tour_specific'

### marketing_included_items (포함/불포함)
- `category`: '포함사항' | '불포함사항'
- `icon`: 아이콘 키
- `title`: 제목
- `description`: 설명
- `display_order`: 표시 순서

### marketing_special_benefits (특별혜택)
- `benefit_type`: 'discount' | 'gift' | 'upgrade' | 'exclusive'
- `badge_text`: 배지 텍스트
- `badge_color`: 'red' | 'blue' | 'green' | 'purple' | 'orange'
- `value`: 할인액 등

## 🎨 커스터마이징

### 아이콘 추가
```sql
INSERT INTO marketing_icons (icon_key, icon_name, category) 
VALUES ('new_icon', '새 아이콘', 'category');
```

### 배지 색상
- `red`: 특별제공 (긴급/한정)
- `blue`: 옵션 (선택사항)
- `green`: 무료 (기본제공)
- `purple`: 기본제공
- `orange`: 한정특가

## ✅ 확인 사항

### 데이터 확인 쿼리
```sql
-- 입력된 데이터 개수 확인
SELECT 
    tp.name as tour_product,
    COUNT(DISTINCT CASE WHEN mii.category = '포함사항' THEN mii.id END) as included_count,
    COUNT(DISTINCT msb.id) as benefits_count,
    COUNT(DISTINCT CASE WHEN mii.category = '불포함사항' THEN mii.id END) as excluded_count
FROM marketing_contents mc
JOIN tour_products tp ON mc.tour_product_id = tp.id
LEFT JOIN marketing_included_items mii ON mc.id = mii.marketing_content_id
LEFT JOIN marketing_special_benefits msb ON mc.id = msb.marketing_content_id
GROUP BY tp.name;
```

## 🚨 주의사항

1. **기존 데이터 삭제**: 쿼리 실행 시 기존 데이터가 삭제됩니다
2. **투어 상품 확인**: 오션비치 투어 상품이 있어야 합니다
3. **권한 설정**: RLS 정책이 적용되어 있습니다

## 📞 문의사항

문제 발생 시 다음 파일들을 확인하세요:
- `/supabase/marketing_content_tables.sql` - 테이블 생성
- `/supabase/marketing_content_real_data.sql` - 실제 데이터
- `/components/marketing/SingSingMarketingDisplay.tsx` - 표시 컴포넌트
- `/components/admin/MarketingContentManager.tsx` - 관리 컴포넌트
