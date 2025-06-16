# 투어 일정 엿보기 업데이트 가이드

## 개요
투어 일정 엿보기 기능이 `journey_management` 테이블 대신 `tourist_attractions`와 `tour_schedule_spots` 테이블을 사용하도록 업데이트되었습니다.

## 주요 변경 사항

### 1. 데이터 구조 변경
- **이전**: `journey_management` 테이블에서 일정 정보 가져옴
- **현재**: `tour_schedule_spots` + `tourist_attractions` 테이블에서 스팟 정보 가져옴

### 2. UI/UX 개선
- D1, D2, D3... 형식의 탭 네비게이션
- 각 일자별 스팟 정보를 카드 형태로 표시
- 카테고리별 색상 및 아이콘 구분
- 1인 가격을 크게, 2인/4인 가격을 작게 표시

### 3. 새로운 테이블 구조

#### `tour_schedule_spots` 테이블
```sql
CREATE TABLE tour_schedule_spots (
  id UUID PRIMARY KEY,
  tour_id UUID NOT NULL,        -- singsing_tours 참조
  day INTEGER NOT NULL,         -- 일차 (1, 2, 3...)
  sequence INTEGER NOT NULL,    -- 순서
  spot_id UUID NOT NULL,        -- tourist_attractions 참조
  start_time TEXT,              -- 시작 시간
  end_time TEXT,                -- 종료 시간
  notes TEXT,                   -- 메모
  category VARCHAR(100)         -- 카테고리
);
```

## 사용 방법

### 1. 데이터베이스 설정
```bash
# 1. tour_schedule_spots 테이블 생성
psql -d your_database < supabase/create_tour_schedule_spots_table.sql

# 2. 샘플 데이터 추가 (선택사항)
psql -d your_database < supabase/sample_tour_schedule_spots_data.sql
```

### 2. 관리자 페이지에서 스팟 추가
1. 투어 관리 > 투어 스케줄 관리
2. 해당 투어 선택
3. 일정 관리 탭
4. 장소 추가 버튼 클릭
5. tourist_attractions에서 스팟 선택

### 3. 카테고리 종류
- `골프장`, `골프` - 골프 관련
- `식사`, `조식`, `중식`, `석식` - 식사 관련
- `숙박`, `호텔` - 숙박 관련
- `관광`, `관광지` - 관광 관련
- `버스탑승` - 교통 관련
- `기타` - 기타

## 표시되는 정보

### 각 스팟별 표시 정보
- 스팟 이름
- 카테고리 (아이콘과 색상으로 구분)
- 시작 시간 (있는 경우)
- 설명
- 주소
- 이미지 (main_image_url)
- 특징 (features)
- 식사 정보 (meal_info)

### 견적 요약 정보
- 포함사항: 리무진 버스, 그린피, 카트비, 숙박, 조식 등
- 특별 혜택: 지역 맛집 투어, 그룹 사진, 물 및 간식
- 불포함사항: 캐디피, 중식/석식, 개인 경비

## 주의 사항
1. `tour_schedule_spots`에 데이터가 없으면 "선택한 일자에 등록된 일정이 없습니다" 표시
2. 총 일수는 스팟 데이터의 최대 day 값으로 계산
3. 스팟이 없으면 투어 시작일-종료일로 일수 계산

## 문제 해결
- 일정이 표시되지 않는 경우: `tour_schedule_spots` 테이블에 데이터 확인
- 이미지가 표시되지 않는 경우: `tourist_attractions`의 `main_image_url` 확인
- 카테고리 아이콘이 이상한 경우: 카테고리 이름 확인