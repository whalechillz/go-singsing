# 백업 파일 구조 가이드

## 📁 디렉토리 구조

```
backup_files/
├── 20250527/               # 2025년 5월 27일 백업
│   └── 결제 관련 컴포넌트 백업
├── 20250528/               # 2025년 5월 28일 백업
│   └── 메모 시스템 관련 백업
├── 20250530/               # 2025년 5월 30일 백업
│   ├── component_backups/  # 컴포넌트 백업 파일들
│   ├── shell_scripts/      # 쉘 스크립트 및 자동화 파일들
│   ├── supabase_db_files/  # Supabase DB 관련 SQL 파일들
│   └── supabase_migrations/# DB 마이그레이션 파일들
└── misc_docs/              # 기타 문서 및 가이드
```

## 📅 날짜별 백업 내용

### 2025년 5월 27일
- 결제 시스템 관련 컴포넌트 백업
- PaymentManagerV3 버그 수정 파일

### 2025년 5월 28일
- 메모 시스템 구현 관련 백업
- 업무 메모 시스템 파일들

### 2025년 5월 30일
- **component_backups/**: React 컴포넌트 백업
  - AdminSidebarLayout.tsx.backup
  - ParticipantsManager.tsx.backup_old
  - ParticipantsManagerV2.tsx.backup
  
- **shell_scripts/**: 자동화 스크립트
  - Git 커밋 스크립트들 (git-commit*.sh)
  - 배포 스크립트 (deploy-now.sh)
  - 수정 스크립트 (fix-product-error.sh)
  - 기타 유틸리티 스크립트
  
- **supabase_db_files/**: DB 관련 SQL
  - UUID 수정 스크립트
  - 메모 테이블 수정 스크립트
  - 기타 DB 수정 파일들
  
- **supabase_migrations/**: DB 마이그레이션
  - Phase 2 마이그레이션 파일들
  - 기능별 마이그레이션 SQL 파일들

## 🔧 기타 문서 (misc_docs/)
- Git 커밋 가이드
- 배포 및 테스트 가이드
- 기타 프로젝트 문서

## 💡 백업 복원 방법

### 1. 컴포넌트 복원
```bash
cp backup_files/20250530/component_backups/[파일명] components/
```

### 2. 스크립트 복원
```bash
cp backup_files/20250530/shell_scripts/[스크립트명] .
chmod +x [스크립트명]
```

### 3. DB 마이그레이션 복원
```bash
cp -r backup_files/20250530/supabase_migrations/migrations supabase/
```

## ⚠️ 주의사항
- 백업 파일 복원 시 현재 파일을 덮어쓰지 않도록 주의
- 복원 전 현재 상태를 먼저 백업
- DB 관련 파일은 실행 전 충분한 검토 필요

---
최종 업데이트: 2025년 5월 30일
