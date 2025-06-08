# Phase 2 데이터베이스 마이그레이션 가이드

## 개요
Phase 2에서는 투어 관리 시스템의 핵심 기능을 위한 데이터베이스 확장을 진행합니다.

## 새로운 테이블
1. **room_assignments** - 객실 배정 관리
2. **tee_times** - 티오프 시간 및 조 편성
3. **boarding_schedules** - 탑승 스케줄 관리
4. **user_roles** - 사용자 권한 관리
5. **user_profiles** - 사용자 프로필 확장
6. **product_reviews** - 상품 리뷰 시스템

## 마이그레이션 실행 순서

### 1. Supabase 대시보드에서 실행
```sql
-- 순서대로 실행
-- 1. 투어 테이블 확장
-- 파일: 001_update_tours_table.sql

-- 2. 객실 배정 테이블
-- 파일: 002_create_room_assignments.sql

-- 3. 티오프 시간 테이블
-- 파일: 003_create_tee_times.sql

-- 4. 탑승 스케줄 테이블
-- 파일: 004_create_boarding_schedules.sql

-- 5. 사용자 권한 시스템
-- 파일: 005_create_user_roles.sql

-- 6. 여행상품 확장
-- 파일: 006_update_tour_products.sql
```

### 2. 로컬에서 Supabase CLI 사용
```bash
# Supabase 프로젝트에 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push

# 또는 개별 실행
supabase db execute -f supabase/migrations/phase2/001_update_tours_table.sql
supabase db execute -f supabase/migrations/phase2/002_create_room_assignments.sql
# ... 나머지 파일들
```

## 주요 변경사항

### tours 테이블 확장
- `status` - 투어 상태 (upcoming, ongoing, completed, cancelled)
- `max_participants` - 최대 참가자 수
- `current_participants` - 현재 참가자 수 (자동 계산)

### 권한 시스템
- **super_admin** - 전체 시스템 관리
- **office_admin** - 사무실 관리자 (실무자)
- **staff** - 현장 스탭 (가이드, 기사)
- **customer** - 일반 고객

### RLS (Row Level Security) 정책
- 각 테이블별 접근 권한 설정
- 관리자/스탭/고객별 차등 권한

## 마이그레이션 후 확인사항

### 1. 테이블 생성 확인
```sql
-- 새 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'room_assignments', 
    'tee_times', 
    'boarding_schedules', 
    'user_roles',
    'user_profiles'
);
```

### 2. 권한 템플릿 확인
```sql
-- 권한 템플릿 데이터 확인
SELECT * FROM permission_templates;
```

### 3. 트리거 동작 확인
```sql
-- 참가자 수 자동 업데이트 테스트
INSERT INTO singsing_participants (tour_id, name, phone) 
VALUES ('existing-tour-id', '테스트', '010-0000-0000');

-- tours 테이블의 current_participants 확인
SELECT id, title, current_participants FROM singsing_tours 
WHERE id = 'existing-tour-id';
```

## 롤백 방법
문제 발생 시 각 마이그레이션의 롤백:

```sql
-- 예: room_assignments 롤백
DROP TABLE IF EXISTS room_assignment_history CASCADE;
DROP TABLE IF EXISTS room_assignments CASCADE;
DROP TYPE IF EXISTS room_type CASCADE;

-- 다른 테이블도 동일한 방식으로 롤백
```

## 주의사항
1. **프로덕션 환경**에서는 반드시 백업 후 실행
2. **RLS 정책**은 즉시 적용되므로 권한 설정 필요
3. **기존 데이터**가 있는 경우 마이그레이션 스크립트가 자동으로 처리

## 다음 단계
마이그레이션 완료 후:
1. 관리자 계정에 `super_admin` 권한 부여
2. 기존 참가자 데이터와 사용자 연결
3. Phase 3 개발 시작 (5개 투어 관리 페이지)