# Phase 2 마이그레이션 실행 체크리스트

## 🔍 사전 확인 완료
- [x] singsing_tours = 여행상품/골프장 정보 (NOT 실제 투어)
- [x] singsing_schedules = 실제 투어 스케줄
- [x] 기존 테이블 존재 확인 (rooms, tee_times, boarding_guide_*)

## 📂 수정된 마이그레이션 파일
1. [x] 001_update_schedules_table_revised.sql (새 파일)
2. [x] 002_update_room_system.sql (새 파일)
3. [x] 003_update_tee_time_system.sql (새 파일)  
4. [x] 004_create_boarding_system.sql (새 파일)
5. [x] 005_create_user_roles.sql (기존 파일 사용)
6. [x] 006_update_product_system.sql (새 파일 - singsing_tours 확장)

## ⚠️ 주의사항
- 001_update_tours_table.sql → 사용하지 않음 (잘못된 이해)
- 002_create_room_assignments.sql → 사용하지 않음 (테이블 중복)
- 003_create_tee_times.sql → 사용하지 않음 (테이블 중복)
- 004_create_boarding_schedules.sql → 사용하지 않음 (구조 변경)

## 🚀 실행 단계별 명령어

### Step 1: 백업 (Supabase SQL Editor)
```sql
-- 실행 전 백업 필수!
CREATE TABLE singsing_schedules_backup_20240530 AS SELECT * FROM singsing_schedules;
CREATE TABLE singsing_tours_backup_20240530 AS SELECT * FROM singsing_tours;
CREATE TABLE singsing_rooms_backup_20240530 AS SELECT * FROM singsing_rooms;
CREATE TABLE singsing_tee_times_backup_20240530 AS SELECT * FROM singsing_tee_times;
CREATE TABLE singsing_participants_backup_20240530 AS SELECT * FROM singsing_participants;
```

### Step 2: 마이그레이션 실행
```sql
-- 1. 스케줄 테이블 확장 (001_update_schedules_table_revised.sql 내용 실행)
-- 2. 객실 시스템 확장 (002_update_room_system.sql 내용 실행)
-- 3. 티오프 시스템 확장 (003_update_tee_time_system.sql 내용 실행)
-- 4. 탑승 시스템 생성 (004_create_boarding_system.sql 내용 실행)
-- 5. 사용자 권한 시스템 (005_create_user_roles.sql 내용 실행)
-- 6. 상품 시스템 확장 (006_update_product_system.sql 내용 실행)
```

### Step 3: 검증 쿼리
```sql
-- 스케줄 확장 필드 확인
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'singsing_schedules' 
AND column_name IN ('status', 'max_participants', 'current_participants');

-- 새 테이블 생성 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'room_participant_assignments',
    'boarding_buses',
    'boarding_assignments',
    'user_roles',
    'permission_templates'
);

-- 트리거 확인
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%updated_at%';
```

### Step 4: 데이터 확인
```sql
-- 스케줄 상태 확인
SELECT status, COUNT(*) 
FROM singsing_schedules 
GROUP BY status;

-- 참가자 수 확인
SELECT id, title, current_participants 
FROM singsing_schedules 
WHERE current_participants > 0
LIMIT 5;

-- 권한 템플릿 확인
SELECT role, description 
FROM permission_templates;
```

## 📝 실행 후 작업

### 1. 관리자 권한 부여
```sql
-- 관리자 user_id 확인 후 실행
SELECT assign_user_role('관리자-USER-ID', 'super_admin');
```

### 2. 테스트 데이터
```sql
-- 버스 테스트 데이터
INSERT INTO boarding_buses (schedule_id, bus_number, bus_type, driver_name, departure_date, departure_time)
SELECT id, 1, '45_seater', '김기사', date, '06:00:00'
FROM singsing_schedules
WHERE status = 'upcoming'
LIMIT 1;

-- 객실 배정 테스트
-- room_participant_assignments 테이블에 테스트 데이터 삽입
```

### 3. 코드 수정 필요 사항
- [ ] tour_id → schedule_id 매핑 확인
- [ ] 새로운 테이블 구조에 맞춰 API 수정
- [ ] 권한 체크 로직 추가

## 🚨 문제 발생 시
```sql
-- 전체 롤백
DROP TABLE IF EXISTS room_participant_assignments CASCADE;
DROP TABLE IF EXISTS boarding_buses CASCADE;
DROP TABLE IF EXISTS boarding_assignments CASCADE;
-- ... 기타 새로 생성된 테이블

-- 백업에서 복원
DROP TABLE singsing_schedules;
ALTER TABLE singsing_schedules_backup_20240530 RENAME TO singsing_schedules;
-- ... 기타 테이블도 동일하게 복원
```

## ✅ 최종 확인
- [ ] 모든 마이그레이션 성공
- [ ] 기존 데이터 정상 작동
- [ ] 새 기능 테스트 완료
- [ ] 권한 시스템 작동 확인
- [ ] RLS 정책 활성화 확인

---
실행 시간: ________________
실행자: ________________
결과: ________________