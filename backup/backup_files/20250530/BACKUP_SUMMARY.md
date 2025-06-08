# 프로젝트 전체 정리 및 백업 - 2025년 5월 30일

## 백업 처리 완료 항목

### 1. Supabase DB 관련 SQL 파일들
아래 파일들을 `/backup_files/20250530/supabase_db_files/` 폴더로 이동:
- check_uuid_and_test.sql
- db_dump.sql
- fix_memo_tables.sql
- fix_memo_template_rls.sql
- fix_template_id_issue.sql
- fix_uuid_generation.sql
- restore_templates.sql

### 2. 데이터베이스 스키마 덤프 완료
- 위치: `/docs/database/schema-latest.sql`
- 전체 데이터베이스 구조 및 데이터 포함

### 3. 마이그레이션 파일 백업
아래 디렉토리들을 `/backup_files/20250530/supabase_migrations/` 폴더로 이동:
- migrations/ (모든 마이그레이션 파일 포함)
  - phase2/ 디렉토리 포함
  - 20240611_add-courses-to-tour-products.sql
  - 20250520_add_group_columns.sql.backup
  - 20250528_create_memo_system.sql
  - 20250528_create_work_memo_system.sql
  - 20250520235520_add-gender-to-participants.sql
  - 20250520235521_update_payment_columns.sql
- .temp/ (Supabase CLI 임시 파일)
- .DS_Store

### 4. 현재 Supabase 디렉토리 구조
```
supabase/
└── types.ts      (TypeScript 타입 정의 파일만 보존)
```

### 보존한 항목
- `/supabase/types.ts` - TypeScript 타입 정의를 위해 보존

### 백업 위치
- SQL 파일들: `/backup_files/20250530/supabase_db_files/`
- 마이그레이션 파일들: `/backup_files/20250530/supabase_migrations/`

### 5. 루트 디렉토리 스크립트 백업
아래 파일들을 `/backup_files/20250530/shell_scripts/` 폴더로 이동:
- commit-product-update.sh
- fix-product-error.sh 
- git-commit-phase1.sh
- git-commit.sh
- run-commit.sh
- add-tailwind-link.js
- deploy-now.sh

### 6. 컴포넌트 백업 파일 정리
아래 파일들을 `/backup_files/20250530/component_backups/` 폴더로 이동:
- AdminSidebarLayout.tsx.backup
- ParticipantsManager.tsx.backup_old
- ParticipantsManagerV2.tsx.backup

### 7. 기타 문서 정리
- redeploy.md → `/backup_files/misc_docs/`
- GIT_COMMIT_GUIDE.md → `/backup_files/misc_docs/`
- deployment_and_testing_guide.md → `/backup_files/misc_docs/`

## 📂 최종 백업 구조
```
backup_files/
├── 20250527/
├── 20250528/
├── 20250530/
│   ├── component_backups/     (컴포넌트 백업)
│   ├── shell_scripts/         (스크립트 파일)
│   ├── supabase_db_files/     (DB SQL 파일)
│   ├── supabase_migrations/   (마이그레이션)
│   └── BACKUP_SUMMARY.md      (이 문서)
├── misc_docs/                 (기타 문서)
└── README.md                  (백업 가이드)
```

---
백업 일시: 2025년 5월 30일
프로젝트 정리 완료 ✅
