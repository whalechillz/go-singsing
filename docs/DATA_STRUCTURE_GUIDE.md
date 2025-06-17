# 싱싱골프투어 데이터 구조 정의 가이드

## 📋 Overview
싱싱골프투어 시스템의 데이터베이스 구조 및 사용 가이드입니다.

*최종 업데이트: 2025-06-18*

## 🗂️ 데이터 레이어 구조

```
┌─────────────────────────────────────────────────┐
│  🎯 마케팅/고객용 데이터 (Marketing Layer)      │
│  - tour_with_auto_badges (VIEW)                 │
│  - 고객 페이지 표시용                           │
│  - 자동 계산 필드 포함 (참가자수, 뱃지 등)     │
└─────────────────────────────────────────────────┘
                       ↑
┌─────────────────────────────────────────────────┐
│  📊 기본 투어 데이터 (Base Layer)               │
│  - singsing_tours (TABLE)                       │
│  - 투어 기본 정보만 저장                        │
│  - 레거시 필드 포함 (미사용 필드 다수)         │
└─────────────────────────────────────────────────┘
                       +
┌─────────────────────────────────────────────────┐
│  📅 운영/상세 데이터 (Operational Layer)        │
│  - tour_journey_items (일정 항목)               │
│  - tourist_attractions (장소 정보)              │
│  - tour_boarding_places (탑승 정보)             │
│  - 실제 투어 운영에 필요한 상세 정보           │
└─────────────────────────────────────────────────┘
```

## 📊 주요 테이블 설명

### 1. **tour_with_auto_badges** (VIEW)
고객 페이지 표시용 통합 뷰입니다.

**주요 필드:**
- ✅ `current_participants` - 실제 참가자 수 (자동 계산)
- ✅ `marketing_participant_count` - 마케팅 표시 인원 (수동 설정)
- ✅ `is_closed`, `closed_reason`, `closed_at` - 마감 관련
- ✅ `departure_location`, `itinerary`, `included_items`, `notes` - 일정 정보
- ✅ `is_special_price`, `special_badge_text`, `badge_priority` - 뱃지 관련
- ✅ 모든 문서 설정 필드들

### 2. **singsing_tours** (TABLE)
기본 투어 정보 테이블입니다.

**핵심 필드:**
- `title`, `start_date`, `end_date`
- `price`, `max_participants`
- `tour_product_id` → `tour_products`
- `driver_name`

**⚠️ 주의:** 이 테이블의 많은 필드가 레거시로 실제 사용되지 않습니다.

### 3. **tour_journey_items** (TABLE)
일정 엿보기의 핵심 테이블입니다.

**구조:**
- `tour_id` → 투어 연결
- `day_number` - 일차
- `order_index` - 순서
- `spot_id` → `tourist_attractions`
- `arrival_time`, `departure_time`
- `meal_type`, `meal_menu`

### 4. **tourist_attractions** (TABLE)
장소 정보 마스터 테이블입니다.

**카테고리:**
- 골프장, 식사(조식/중식/석식), 숙박, 관광지
- `main_image_url` - 대표 이미지
- `features` - 특징 배열
- `description` - 설명

### 5. **tour_products** (TABLE)
투어 상품 템플릿입니다.

**주요 정보:**
- `name` - 상품명
- `golf_course` - 골프장
- `hotel` - 숙소
- `included_items`, `excluded_items` - 포함/불포함 사항

## 🔧 용어 정의 및 사용 규칙

### 1. 용어 정의

| 구분 | 용어 | 설명 | 사용처 |
|------|------|------|--------|
| **마케팅 데이터** | "마케팅 표시 정보" | `tour_with_auto_badges` 뷰의 데이터 | 고객 페이지 |
| **기본 데이터** | "투어 기본 정보" | `singsing_tours` 테이블의 핵심 필드 | 투어 생성/수정 |
| **운영 데이터** | "투어 운영 정보" | journey_items, attractions 등 | 일정표, 문서 |
| **일정 엿보기** | "투어 상세 일정" | journey_items + attractions 조합 | 고객 미리보기 |

### 2. 작업별 사용 가이드

```yaml
고객 페이지 표시:
  - 사용: tour_with_auto_badges (VIEW)
  - 이유: 자동 계산 필드, 마케팅 정보 포함

투어 생성/수정:
  - 사용: singsing_tours (TABLE)
  - 이유: 기본 정보 직접 수정

일정 상세 관리:
  - 사용: tour_journey_items + tourist_attractions
  - 이유: 실제 운영 데이터

문서 생성:
  - 기본 정보: tour_with_auto_badges
  - 상세 일정: tour_journey_items + tourist_attractions
```

### 3. 커뮤니케이션 규칙

```
❌ "투어 정보 수정해줘"
✅ "투어 기본 정보 수정해줘" (singsing_tours)
✅ "투어 운영 일정 수정해줘" (journey_items)

❌ "일정표 보여줘"
✅ "마케팅용 일정표 보여줘" (tour_with_auto_badges)
✅ "운영용 상세 일정 보여줘" (journey_items)

❌ "참가자 수 업데이트"
✅ "실제 참가자 수 확인" (자동 계산)
✅ "마케팅 표시 인원 수정" (marketing_participant_count)
```

## 🚨 주의사항

### 1. 데이터 동기화
- `current_participants`는 트리거로 자동 계산되므로 직접 수정 금지
- 마케팅 표시 인원은 의도적으로 다르게 표시할 때만 설정
- 일정 데이터는 용도별로 다른 테이블 사용

### 2. 레거시 필드
- `singsing_tours`의 많은 필드가 미사용 상태
- 실제 일정은 `tour_journey_items` 사용
- 탑승 정보는 별도 테이블 확인 필요

### 3. 뷰 사용시 주의
- `tour_with_auto_badges`는 뷰이므로 직접 INSERT/UPDATE 불가
- 기본 데이터는 `singsing_tours`에서 수정
- 뷰는 조회 전용으로만 사용

## 📝 코드 예시

### 고객 페이지 투어 목록
```typescript
const { data } = await supabase
  .from("tour_with_auto_badges")
  .select("*")
  .order("start_date", { ascending: true });
```

### 투어 기본 정보 수정
```typescript
const { error } = await supabase
  .from("singsing_tours")
  .update({ 
    title: "새로운 투어명",
    marketing_participant_count: 20 
  })
  .eq("id", tourId);
```

### 일정 엿보기 데이터
```typescript
const { data } = await supabase
  .from("tour_journey_items")
  .select(`
    *,
    tourist_attraction:tourist_attractions!spot_id(*)
  `)
  .eq("tour_id", tourId)
  .order("day_number", { ascending: true })
  .order("order_index", { ascending: true });
```

## 🔄 향후 개선 사항

1. **테이블 정리**
   - `singsing_tours`의 레거시 필드 제거
   - 실제 사용 필드만 남기고 정리

2. **통합 관리**
   - 투어 운영 정보 입력 UI 개선
   - 일정 엿보기 데이터 관리 도구

3. **성능 최적화**
   - 자주 사용하는 조인에 대한 materialized view 고려
   - 인덱스 최적화

---

## 📎 관련 문서
- `/app/page.tsx` - 고객 페이지
- `/app/admin/tours/page.tsx` - 관리자 투어 목록
- `/components/tour/TourSchedulePreview.tsx` - 일정 엿보기 컴포넌트