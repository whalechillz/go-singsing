# 마이그레이션 관리 가이드

## 현재 상황
- `supabase/migrations/` 폴더에 많은 마이그레이션 파일이 있음
- 일부는 이미 수동으로 실행됨
- `supabase db push`를 사용하면 모든 파일을 다시 실행하려고 함

## 해결 방법

### 1. 폴더 구조
```
supabase/
├── migrations/          # Supabase CLI가 관리하는 폴더
├── pending_migrations/  # 아직 실행하지 않은 마이그레이션
└── executed_migrations/ # 이미 실행 완료한 마이그레이션 (기록용)
```

### 2. 새 마이그레이션 추가 시
1. `pending_migrations/` 폴더에 먼저 생성
2. SQL Editor에서 수동 실행
3. 성공하면 `executed_migrations/`로 이동
4. 또는 `migration_history` 테이블에 기록

### 3. 안전한 실행 절차
```sql
-- 1. 테이블 존재 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'email_templates';

-- 2. 없다면 마이그레이션 실행
-- pending_migrations/20250114_email_templates.sql 내용 실행

-- 3. 실행 기록
INSERT INTO migration_history (filename, executed_by, notes) 
VALUES ('20250114_email_templates.sql', 'manual', '이메일 템플릿 시스템 추가');
```

### 4. 팀 협업 시
- `migration_history` 테이블을 확인하여 어떤 마이그레이션이 실행되었는지 파악
- 새 마이그레이션은 항상 `pending_migrations/`에 먼저 추가
- 실행 완료 후 팀에게 공유

### 5. Supabase CLI 사용 시
```bash
# 특정 마이그레이션만 실행 (지원되지 않음)
# 대신 SQL Editor 사용 권장

# 또는 로컬 DB에서 테스트
supabase db reset  # 로컬 DB 초기화
supabase db push   # 로컬 DB에 적용
```

## 현재 pending_migrations/
- `00_create_migration_tracking.sql` - 마이그레이션 추적 테이블
- `20250114_email_templates.sql` - 이메일 템플릿 시스템
