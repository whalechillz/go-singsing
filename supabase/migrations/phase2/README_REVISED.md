# Phase 2 데이터베이스 마이그레이션 실행 가이드 (수정본)

## ⚠️ 중요: 기존 테이블 구조 확인 완료

### 현재 데이터베이스 구조
- **singsing_tours** → 여행상품/골프장 정보 (실제 투어가 아님)
- **singsing_schedules** → 실제 투어 스케줄 ✅
- **singsing_rooms** → 이미 존재
- **singsing_tee_times**, **singsing_tee_time_players** → 이미 존재
- **boarding_guide_*** → 탑승 관련 테이블 이미 존재
- **singsing_participants** → 참가자 테이블

## 📋 수정된 마이그레이션 파일

### 1. **001_update_schedules_table_revised.sql**
- singsing_schedules 테이블 확장 (실제 투어)
- status, max_participants 등 필드 추가
- singsing_tours에 상품 관련 필드 추가

### 2. **002_update_room_system.sql**
- 기존 singsing_rooms 테이블 확장
- room_participant_assignments 테이블 생성 (참가자-객실 연결)
- 객실 배정 히스토리

### 3. **003_update_tee_time_system.sql**
- 기존 singsing_tee_times 테이블 확장
- singsing_tee_time_players 테이블 확장
- 티오프 변경 이력 추가

### 4. **004_create_boarding_system.sql**
- boarding_buses 테이블 신규 생성
- boarding_assignments 테이블 생성
- 기존 boarding_guide_* 테이블과 연동

### 5. **005_create_user_roles.sql** (기존 파일 사용)
- 사용자 권한 시스템

### 6. **006_update_tour_products.sql** (기존 파일 사용)
- tour_products 테이블 확장

## 🚀 실행 순서

### 1단계: 백업 (필수!)
```sql
-- 중요 테이블 백업
CREATE TABLE singsing_schedules_backup AS SELECT * FROM singsing_schedules;
CREATE TABLE singsing_tours_backup AS SELECT * FROM singsing_tours;
CREATE TABLE singsing_rooms_backup AS SELECT * FROM singsing_rooms;
CREATE TABLE singsing_tee_times_backup AS SELECT * FROM singsing_tee_times;
```

### 2단계: 마이그레이션 실행
```bash
# Supabase SQL Editor에서 순서대로 실행

# 1. 스케줄 테이블 확장
/supabase/migrations/phase2/001_update_schedules_table_revised.sql

# 2. 객실 시스템 확장
/supabase/migrations/phase2/002_update_room_system.sql

# 3. 티오프 시스템 확장
/supabase/migrations/phase2/003_update_tee_time_system.sql

# 4. 탑승 시스템 생성
/supabase/migrations/phase2/004_create_boarding_system.sql

# 5. 사용자 권한 시스템
/supabase/migrations/phase2/005_create_user_roles.sql

# 6. 상품 테이블 확장
/supabase/migrations/phase2/006_update_tour_products.sql
```

### 3단계: 검증
```sql
-- 1. 스케줄 상태 확인
SELECT id, title, status, current_participants, max_participants 
FROM singsing_schedules LIMIT 5;

-- 2. 새 테이블 확인
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'room_participant_assignments'
);

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'boarding_buses'
);

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'user_roles'
);

-- 3. 권한 템플릿 확인
SELECT * FROM permission_templates;

-- 4. 트리거 동작 확인
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🔧 문제 발생 시 롤백

```sql
-- 예시: 스케줄 테이블 롤백
ALTER TABLE singsing_schedules 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS max_participants,
DROP COLUMN IF EXISTS current_participants;

-- 새로 생성된 테이블 삭제
DROP TABLE IF EXISTS room_participant_assignments CASCADE;
DROP TABLE IF EXISTS boarding_buses CASCADE;
DROP TABLE IF EXISTS boarding_assignments CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- 백업에서 복원
DROP TABLE singsing_schedules;
ALTER TABLE singsing_schedules_backup RENAME TO singsing_schedules;
```

## ✅ 실행 후 확인사항

1. **스케줄 상태 업데이트 확인**
   - 과거 날짜 → 'completed'
   - 미래 날짜 → 'upcoming'
   - 현재 진행중 → 'ongoing'

2. **참가자 수 자동 계산**
   - current_participants 필드가 올바르게 계산되었는지 확인

3. **권한 시스템**
   - permission_templates 데이터 확인
   - 관리자 계정에 super_admin 권한 부여 필요

4. **RLS 정책**
   - 각 테이블의 RLS가 활성화되었는지 확인
   - 권한별 접근 테스트

## 📌 주의사항

1. **tour_id vs schedule_id**
   - 많은 테이블에서 tour_id는 실제로 singsing_schedules.id를 참조
   - 코드에서도 이 점 주의 필요

2. **기존 데이터 연동**
   - boarding_guide_* 테이블들은 그대로 유지
   - 새로운 boarding_buses 시스템과 병행 사용

3. **참가자 user_id 연결**
   - singsing_participants.user_id 필드 추가됨
   - 추후 회원가입 시스템과 연동 예정

## 다음 단계

마이그레이션 완료 후:
1. 관리자 계정에 super_admin 권한 부여
2. 테스트 데이터로 기능 검증
3. Phase 3 개발 시작 (5개 관리 페이지)