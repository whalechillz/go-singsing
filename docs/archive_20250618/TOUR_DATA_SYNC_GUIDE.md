# 투어 데이터 동기화 가이드

## 📊 데이터 구조 개요

### 1. 주요 테이블

#### `singsing_tours` - 투어 기본 정보
- **참가자 수 관리**
  - `current_participants` - 실제 참가자 수 (자동 계산)
  - `marketing_participant_count` - 마케팅 표시 인원 (수동 설정)
  
- **마감 관리**
  - `is_closed` - 투어 마감 여부
  - `closed_reason` - 마감 사유
  - `closed_at` - 마감 시간

- **일정 정보**
  - `departure_location` - 출발 장소
  - `itinerary` - 상세 일정
  - `included_items` - 포함 사항
  - `notes` - 기타 안내사항

- **마케팅 뱃지**
  - `is_special_price` - 특가 뱃지 표시 여부
  - `special_badge_text` - 뱃지 텍스트 (예: "얼리버드 특가")
  - `badge_priority` - 뱃지 우선순위

#### `singsing_schedules` - 일정별 상세 정보
- Day별 상세 일정을 관리
- ⚠️ **주의**: 실제로 "일정 엿보기"는 아래 테이블들을 사용합니다

#### `tour_journey_items` - 일정 엿보기 항목
- Day별 여행 일정 항목
- 관광지, 식사, 숙박 등의 순서와 시간 관리
- `tourist_attractions` 테이블과 조인

#### `tourist_attractions` - 관광지/장소 정보
- 골프장, 식당, 호텔, 관광지 등의 상세 정보
- 이미지, 설명, 특징 등 포함

#### `tour_boarding_places` - 탑승 장소 정보
- 버스 탑승 장소와 시간 관리
- 일정 엿보기에서 출발 정보 표시

## 🔄 데이터 동기화 플로우

### 1. 참가자 수 동기화
```
singsing_participants (참가자 추가/삭제)
    ↓ (트리거)
singsing_tours.current_participants (자동 업데이트)
    ↓ 
고객 페이지 표시 (marketing_participant_count 우선)
```

### 2. 고객 페이지 표시 로직
- **표시 인원**: `marketing_participant_count` ?? `current_participants`
- **마감 상태**: `is_closed` 또는 `current_participants >= max_participants`
- **뱃지 표시**: 자동 뱃지(마감임박, 인기) + 수동 뱃지

## ⚙️ 마이그레이션 실행

```bash
# 실행 권한 부여
chmod +x run-tour-migration.sh

# 마이그레이션 실행
./run-tour-migration.sh
```

## 📝 사용 예시

### 1. 마케팅 표시 인원 설정
```sql
-- 실제 16명이지만 20명으로 표시 (인기 있어 보이게)
UPDATE singsing_tours 
SET marketing_participant_count = 20 
WHERE id = 'tour-id';

-- 실제 2명이지만 8명으로 표시 (최소 인원 충족 보이게)
UPDATE singsing_tours 
SET marketing_participant_count = 8 
WHERE id = 'tour-id';
```

### 2. 투어 마감 설정
```sql
-- 투어 마감
UPDATE singsing_tours 
SET is_closed = true, 
    closed_reason = '조기 마감',
    closed_at = NOW()
WHERE id = 'tour-id';
```

### 3. 특별 뱃지 설정
```sql
-- 얼리버드 특가 뱃지
UPDATE singsing_tours 
SET is_special_price = true,
    special_badge_text = '얼리버드 특가',
    badge_priority = 5
WHERE id = 'tour-id';
```

## 🎯 주요 기능

### 1. 자동 뱃지 시스템
- **마감임박**: 잔여석 3석 이하
- **최저가**: 같은 골프장 중 최저가 (30일 이내)
- **인기**: 참가율 70% 이상

### 2. 일정 표시
- **기본 일정표**: `singsing_tours` 테이블의 필드 사용
  - `departure_location` - 출발 장소
  - `itinerary` - 상세 일정
  - `included_items` - 포함 사항
  - `notes` - 기타 안내사항
- **일정 엿보기**: 여러 테이블 조합
  - `tour_journey_items` - 일정 항목
  - `tourist_attractions` - 장소 상세 정보
  - `tour_boarding_places` - 탑승 정보
- 권한별 차등 표시 (비로그인/참가자/스탭)

### 3. 문서 설정
- 문서별 표시 여부 설정
- 문서별 전화번호 표시 설정
- 스탭/고객용 구분

## ⚠️ 주의사항

1. **참가자 수 계산**
   - `current_participants`는 자동 계산됨 (트리거 사용)
   - 직접 수정하지 말 것

2. **마케팅 표시 인원**
   - `null`인 경우 실제 참가자 수 표시
   - 의도적으로 다르게 표시할 때만 설정

3. **일정 데이터**
   - 기본 정보: `singsing_tours` 테이블
   - 일정 엿보기: 
     - `tour_journey_items` - 일정 항목 순서
     - `tourist_attractions` - 장소 정보
     - `tour_boarding_places` - 탑승 정보
   - 각 용도에 맞는 테이블 관리 필요

## 🔍 문제 해결

### 참가자 수가 맞지 않을 때
```sql
-- 참가자 수 재계산
UPDATE singsing_tours t
SET current_participants = (
  SELECT COUNT(*)
  FROM singsing_participants p
  WHERE p.tour_id = t.id
)
WHERE id = 'tour-id';
```

### 마케팅 표시 초기화
```sql
-- 실제 참가자 수로 초기화
UPDATE singsing_tours
SET marketing_participant_count = current_participants
WHERE id = 'tour-id';
```