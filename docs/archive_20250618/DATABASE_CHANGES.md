# 데이터베이스 변경사항

싱싱골프투어 시스템의 데이터베이스 변경 이력을 관리합니다.

## 목차
- [2025-06-03: 데이터베이스 구조 최적화](#2025-06-03-데이터베이스-구조-최적화)
- [2025-06-02: 테이블 통합 및 구조 개선](#2025-06-02-테이블-통합-및-구조-개선)
- [2025-06-01: 성별 필드 추가](#2025-06-01-성별-필드-추가)
- [마이그레이션 가이드](#마이그레이션-가이드)
- [현재 데이터베이스 구조](#현재-데이터베이스-구조)

---

## 2025-06-03: 데이터베이스 구조 최적화

### 변경 내용

#### 1. 미사용 테이블 삭제
```sql
-- 백업 테이블 삭제
DROP TABLE IF EXISTS singsing_tours_backup CASCADE;
DROP TABLE IF EXISTS singsing_tee_times_backup CASCADE;
DROP TABLE IF EXISTS singsing_tee_time_players_old CASCADE;

-- document 관련 미사용 테이블 삭제
DROP TABLE IF EXISTS document_footers CASCADE;
DROP TABLE IF EXISTS document_notices CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;

-- boarding_guide 관련 테이블 삭제 (이미 통합 완료)
DROP TABLE IF EXISTS boarding_guide_contacts CASCADE;
DROP TABLE IF EXISTS boarding_guide_notices CASCADE;
DROP TABLE IF EXISTS boarding_guide_routes CASCADE;

-- 기타 미사용 테이블 삭제
DROP TABLE IF EXISTS tour_basic_info CASCADE;
DROP TABLE IF EXISTS singsing_pickup_points CASCADE;
DROP TABLE IF EXISTS singsing_work_memo_comments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

#### 2. 미사용 컬럼 삭제
```sql
-- tour_products 테이블 정리
ALTER TABLE tour_products 
DROP COLUMN IF EXISTS schedule CASCADE;

ALTER TABLE tour_products 
DROP COLUMN IF EXISTS reservation_notice CASCADE;

ALTER TABLE tour_products 
DROP COLUMN IF EXISTS note CASCADE;

ALTER TABLE tour_products 
DROP COLUMN IF EXISTS usage_guide CASCADE;
```

#### 3. 성능 최적화를 위한 인덱스 추가
```sql
-- 자주 사용하는 필드에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_singsing_tours_start_date ON singsing_tours(start_date);
CREATE INDEX IF NOT EXISTS idx_singsing_participants_tour_id ON singsing_participants(tour_id);
CREATE INDEX IF NOT EXISTS idx_singsing_participants_status ON singsing_participants(status);
CREATE INDEX IF NOT EXISTS idx_singsing_schedules_tour_id ON singsing_schedules(tour_id);
CREATE INDEX IF NOT EXISTS idx_singsing_schedules_date ON singsing_schedules(date);
CREATE INDEX IF NOT EXISTS idx_singsing_payments_tour_id ON singsing_payments(tour_id);
CREATE INDEX IF NOT EXISTS idx_singsing_tee_times_tour_id ON singsing_tee_times(tour_id);
CREATE INDEX IF NOT EXISTS idx_singsing_tee_times_play_date ON singsing_tee_times(play_date);

-- 통계 정보 업데이트
ANALYZE;
```

#### 4. 최종 테이블 구조 (15개 테이블 + 1개 뷰)
- **핵심 테이블**: tour_products, singsing_tours, singsing_participants, singsing_payments, singsing_schedules, singsing_rooms, singsing_tee_times, singsing_participant_tee_times
- **운영 테이블**: singsing_boarding_places, singsing_tour_boarding_times, singsing_tour_staff
- **기타 테이블**: singsing_memo_templates, singsing_memos, singsing_work_memos, documents
- **뷰**: tour_schedule_preview

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

---

## 2025-06-01: 성별 필드 추가

### 변경 내용

#### 1. singsing_participants 테이블에 gender 필드 추가
```sql
ALTER TABLE singsing_participants 
ADD COLUMN IF NOT EXISTS gender character varying;

-- 허용값: 'M' (남성), 'F' (여성), NULL (미지정)
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

-- 3단계: DB 최적화 (2025-06-03)
\i /supabase/migrations/20250603_database_optimization.sql
```

3. **데이터 검증**
```sql
-- 테이블 개수 확인
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 인덱스 확인
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' ORDER BY tablename;

-- 테이블 크기 확인
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 현재 데이터베이스 구조

### 주요 테이블 관계도
```
tour_products (여행상품 템플릿)
├── name (상품명)
├── golf_courses (골프장 목록) [jsonb]
├── accommodation (숙소)
├── included_items (포함사항)
├── excluded_items (불포함사항)
├── general_notices (일반공지) [jsonb]
├── rounding_notices (라운딩주의사항)
└── usage_* (이용안내)
     ↓
singsing_tours (실제 투어 일정)
├── tour_product_id → tour_products
├── title (투어명)
├── start_date/end_date (날짜)
├── price (가격)
├── notices (공지사항) [jsonb]
└── driver_name (담당자)
     ↓
     ├─→ singsing_participants (참가자)
     │   ├── tour_id → singsing_tours
     │   ├── name (이름)
     │   ├── phone (연락처)
     │   ├── gender (성별) ['M'|'F'|null]
     │   ├── status (상태)
     │   └── room_id → singsing_rooms
     │
     ├─→ singsing_schedules (일정)
     │   ├── tour_id → singsing_tours
     │   ├── date (날짜)
     │   ├── schedule_items (일정항목) [jsonb]
     │   └── boarding_info (탑승정보) [jsonb]
     │
     ├─→ singsing_tee_times (티타임)
     │   ├── tour_id → singsing_tours
     │   ├── play_date (플레이날짜)
     │   ├── golf_course (골프장)
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
     └─→ singsing_tour_staff (스탭)
         ├── tour_id → singsing_tours
         ├── name (이름)
         ├── phone (연락처)
         └── role (역할)
```

### 인덱스 목록
- `idx_singsing_tours_start_date`
- `idx_singsing_participants_tour_id`
- `idx_singsing_participants_status`
- `idx_singsing_schedules_tour_id`
- `idx_singsing_schedules_date`
- `idx_singsing_payments_tour_id`
- `idx_singsing_tee_times_tour_id`
- `idx_singsing_tee_times_play_date`

### 주요 뷰
- `tour_schedule_preview`: 투어 일정 미리보기 통합 뷰

---

## 롤백 가이드

문제 발생 시 다음 순서로 롤백:

### 2025-06-03 변경사항 롤백
```sql
-- 인덱스 제거
DROP INDEX IF EXISTS idx_singsing_tours_start_date;
DROP INDEX IF EXISTS idx_singsing_participants_tour_id;
DROP INDEX IF EXISTS idx_singsing_participants_status;
DROP INDEX IF EXISTS idx_singsing_schedules_tour_id;
DROP INDEX IF EXISTS idx_singsing_schedules_date;
DROP INDEX IF EXISTS idx_singsing_payments_tour_id;
DROP INDEX IF EXISTS idx_singsing_tee_times_tour_id;
DROP INDEX IF EXISTS idx_singsing_tee_times_play_date;

-- 삭제된 컬럼 복원 (데이터는 복구 불가)
ALTER TABLE tour_products ADD COLUMN schedule jsonb;
ALTER TABLE tour_products ADD COLUMN reservation_notice text;
ALTER TABLE tour_products ADD COLUMN note text;
ALTER TABLE tour_products ADD COLUMN usage_guide jsonb;
```

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

4. **성능 모니터링**
   - 인덱스 효과 측정
   - 쿼리 실행 계획 확인
   - 필요시 추가 인덱스 생성

---
*최종 업데이트: 2025-06-03*