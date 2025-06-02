# 데이터베이스 변경사항

싱싱골프투어 시스템의 데이터베이스 변경 이력을 관리합니다.

## 목차
- [2025-06-02: 테이블 통합 및 구조 개선](#2025-06-02-테이블-통합-및-구조-개선)
- [2025-06-01: 성별 필드 추가](#2025-06-01-성별-필드-추가)
- [마이그레이션 가이드](#마이그레이션-가이드)
- [현재 데이터베이스 구조](#현재-데이터베이스-구조)

---

## 2025-06-02: 테이블 통합 및 구조 개선

### 변경 내용

#### 1. 테이블 통합
- `boarding_guide_contacts` → `singsing_tour_staff`로 통합
- `boarding_guide_notices` → `singsing_tours.notices` 필드로 통합  
- `boarding_guide_routes` → `singsing_schedules.boarding_info` 필드로 통합

#### 2. 필드 추가
```sql
-- singsing_tours 테이블에 notices 필드 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS notices jsonb DEFAULT '[]'::jsonb;

-- singsing_schedules 테이블에 boarding_info 필드 추가
ALTER TABLE singsing_schedules 
ADD COLUMN IF NOT EXISTS boarding_info jsonb DEFAULT '{}'::jsonb;
```

#### 3. 새로운 뷰 생성
```sql
CREATE OR REPLACE VIEW tour_schedule_preview AS
SELECT 
  t.id as tour_id,
  t.title as tour_name,
  t.start_date,
  t.end_date,
  t.notices,
  json_agg(
    json_build_object(
      'date', s.schedule_date,
      'day_number', s.day_number,
      'schedule_items', s.schedule_items,
      'boarding_info', s.boarding_info,
      'meal_breakfast', s.meal_breakfast,
      'meal_lunch', s.meal_lunch,
      'meal_dinner', s.meal_dinner,
      'menu_breakfast', s.menu_breakfast,
      'menu_lunch', s.menu_lunch,
      'menu_dinner', s.menu_dinner
    ) ORDER BY s.day_number
  ) as schedules,
  (
    SELECT json_agg(
      json_build_object(
        'name', staff.name,
        'phone', staff.phone,
        'role', staff.role
      ) ORDER BY staff.order
    )
    FROM singsing_tour_staff staff
    WHERE staff.tour_id = t.id
  ) as staff
FROM singsing_tours t
LEFT JOIN singsing_schedules s ON s.tour_id = t.id
GROUP BY t.id;
```

#### 4. 데이터 마이그레이션
```sql
-- 백업 테이블 생성
CREATE TABLE _backup_boarding_guide_contacts AS SELECT * FROM boarding_guide_contacts;
CREATE TABLE _backup_boarding_guide_notices AS SELECT * FROM boarding_guide_notices;
CREATE TABLE _backup_boarding_guide_routes AS SELECT * FROM boarding_guide_routes;

-- 데이터 이전
-- 1. contacts → singsing_tour_staff
INSERT INTO singsing_tour_staff (tour_id, name, phone, role, "order")
SELECT tour_id, name, phone, role, ROW_NUMBER() OVER (PARTITION BY tour_id ORDER BY id)
FROM boarding_guide_contacts;

-- 2. notices → singsing_tours.notices
UPDATE singsing_tours t
SET notices = (
  SELECT json_agg(notice ORDER BY "order")
  FROM boarding_guide_notices n
  WHERE n.tour_id = t.id
);

-- 3. routes → singsing_schedules.boarding_info
WITH boarding_data AS (
  SELECT 
    s.id as schedule_id,
    json_agg(
      json_build_object('time', r.time, 'place', r.place) 
      ORDER BY r."order"
    ) as routes
  FROM singsing_schedules s
  JOIN boarding_guide_routes r ON r.tour_id = s.tour_id
  GROUP BY s.id
)
UPDATE singsing_schedules s
SET boarding_info = json_build_object('routes', bd.routes)
FROM boarding_data bd
WHERE s.id = bd.schedule_id;
```

---

## 2025-06-01: 성별 필드 추가

### 변경 내용

#### 1. singsing_participants 테이블에 gender 필드 추가
```sql
ALTER TABLE singsing_participants 
ADD COLUMN IF NOT EXISTS gender character varying;

-- 허용값: 'M' (남성), 'F' (여성), NULL (미지정)
```

#### 2. 타입 정의
```typescript
type Participant = {
  id: string;
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  tour_id: string;
  gender?: string; // 'M' | 'F' | null
  // ... 기타 필드
};
```

#### 3. 성별 데이터 입력
```sql
-- 예시: 이름 기반 성별 업데이트
UPDATE singsing_participants 
SET gender = 'M' 
WHERE name LIKE '%철수%' OR name LIKE '%영호%';

UPDATE singsing_participants 
SET gender = 'F' 
WHERE name LIKE '%영희%' OR name LIKE '%순자%';
```

---

## 마이그레이션 가이드

### 전체 마이그레이션 순서

1. **백업 생성**
```sql
-- 전체 데이터베이스 백업 권장
pg_dump -h [host] -U [user] -d [database] > backup_$(date +%Y%m%d).sql
```

2. **순차적 마이그레이션 실행**
```sql
-- 1단계: 성별 필드 추가 (2025-06-01)
\i /supabase/migrations/20250601_add_gender_field.sql

-- 2단계: 테이블 통합 (2025-06-02)
\i /supabase/migrations/20250602_consolidate_boarding_tables.sql
```

3. **데이터 검증**
```sql
-- 성별 필드 확인
SELECT gender, COUNT(*) FROM singsing_participants GROUP BY gender;

-- 통합된 데이터 확인
SELECT id, title, notices FROM singsing_tours WHERE notices IS NOT NULL;
SELECT id, schedule_date, boarding_info FROM singsing_schedules WHERE boarding_info != '{}'::jsonb;
```

4. **정리 작업**
```sql
-- 기존 테이블 삭제 (데이터 이전 확인 후)
DROP TABLE IF EXISTS boarding_guide_contacts;
DROP TABLE IF EXISTS boarding_guide_notices;
DROP TABLE IF EXISTS boarding_guide_routes;

-- 백업 테이블 삭제 (선택사항)
DROP TABLE IF EXISTS _backup_boarding_guide_contacts;
DROP TABLE IF EXISTS _backup_boarding_guide_notices;
DROP TABLE IF EXISTS _backup_boarding_guide_routes;
```

---

## 현재 데이터베이스 구조

### 주요 테이블 관계도
```
tour_products (여행상품 템플릿)
├── name (상품명)
├── golf_course (골프장)
├── hotel (숙소)
└── usage_* (이용안내)
     ↓
singsing_tours (실제 투어 일정)
├── tour_product_id → tour_products
├── title (투어명)
├── start_date/end_date (날짜)
├── price (가격)
├── notices (공지사항) [jsonb] ✨ NEW
└── driver_name (담당자)
     ↓
     ├─→ singsing_participants (참가자)
     │   ├── tour_id → singsing_tours
     │   ├── name (이름)
     │   ├── phone (연락처)
     │   ├── gender (성별) ✨ NEW
     │   └── room_id → singsing_rooms
     │
     ├─→ singsing_schedules (일정)
     │   ├── tour_id → singsing_tours
     │   ├── schedule_date (날짜)
     │   ├── schedule_items (일정항목)
     │   └── boarding_info (탑승정보) [jsonb] ✨ NEW
     │
     ├─→ singsing_tee_times (티타임)
     │   ├── tour_id → singsing_tours
     │   ├── date (날짜)
     │   ├── course (코스)
     │   └── tee_time (시간)
     │
     ├─→ singsing_rooms (객실)
     │   ├── tour_id → singsing_tours
     │   ├── room_type (타입)
     │   └── capacity (수용인원)
     │
     ├─→ singsing_payments (결제)
     │   ├── tour_id → singsing_tours
     │   ├── participant_id → singsing_participants
     │   └── amount (금액)
     │
     └─→ singsing_tour_staff (스탭) ✨ NEW
         ├── tour_id → singsing_tours
         ├── name (이름)
         ├── phone (연락처)
         └── role (역할)
```

### 주요 뷰
- `tour_schedule_preview`: 투어 일정 미리보기 통합 뷰 ✨ NEW

### 삭제된 테이블
- ~~boarding_guide_contacts~~ (2025-06-02 삭제)
- ~~boarding_guide_notices~~ (2025-06-02 삭제)
- ~~boarding_guide_routes~~ (2025-06-02 삭제)

---

## 롤백 가이드

문제 발생 시 다음 순서로 롤백:

### 2025-06-02 변경사항 롤백
```sql
-- 1. 백업 테이블에서 원본 복원
CREATE TABLE boarding_guide_contacts AS SELECT * FROM _backup_boarding_guide_contacts;
CREATE TABLE boarding_guide_notices AS SELECT * FROM _backup_boarding_guide_notices;
CREATE TABLE boarding_guide_routes AS SELECT * FROM _backup_boarding_guide_routes;

-- 2. 추가된 필드 제거
ALTER TABLE singsing_tours DROP COLUMN IF EXISTS notices;
ALTER TABLE singsing_schedules DROP COLUMN IF EXISTS boarding_info;

-- 3. 뷰 삭제
DROP VIEW IF EXISTS tour_schedule_preview;

-- 4. 스탭 테이블 정리
DELETE FROM singsing_tour_staff WHERE created_at >= '2025-06-02';
```

### 2025-06-01 변경사항 롤백
```sql
-- 성별 필드 제거 (데이터 손실 주의)
ALTER TABLE singsing_participants DROP COLUMN IF EXISTS gender;
```

---

## 주의사항

1. **프로덕션 적용 전**
   - 테스트 환경에서 충분한 검증
   - 전체 데이터베이스 백업 필수
   - 롤백 계획 수립 및 테스트

2. **타입 정의 업데이트**
   - TypeScript 인터페이스 수정
   - API 응답 타입 확인
   - 프론트엔드 컴포넌트 타입 체크

3. **하위 호환성**
   - 기존 API 엔드포인트 유지
   - 새 필드는 optional로 처리
   - 점진적 마이그레이션 전략

---
*최종 업데이트: 2025-06-02*
