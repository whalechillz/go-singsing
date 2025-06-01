# 싱싱골프투어 관리 시스템 문서

## 📚 문서 목록

### 🚀 시작하기
- [빠른 시작 가이드](./QUICK_START_GUIDE.md) - 새 개발 환경에서 빠르게 시작하기
- [프로젝트 개요](./project-overview.md) - 프로젝트 전체 구조 이해
- [설치 가이드](./setup.md) - 초기 설정 및 환경 구성

### 📊 최신 업데이트
- [프로젝트 현황 (2025-06-01)](./PROJECT_STATUS_20250601.md) - 최신 프로젝트 상태
- [DB 변경사항 (2025-06-01)](./DB_CHANGES_20250601.md) - 성별 필드 추가
- [성별 표시 기능 가이드](./GENDER_DISPLAY_GUIDE.md) - 새로운 기능 사용법

### 🏗 시스템 구조
- [시스템 구조](./system-structure.md) - 전체 아키텍처
- [관리자 구조](./admin-structure.md) - 관리자 페이지 구성
- [UI/UX 구조](./ui-ux-structure.md) - 사용자 인터페이스 설계

### 💾 데이터베이스
- [DB 마이그레이션](./db_migration.md) - 데이터베이스 스키마 변경
- [데이터베이스 문서](./database/) - 테이블 구조 및 관계

### 🎨 디자인
- [디자인 가이드](./design-guide.md) - UI 디자인 원칙
- [디자인 구현](./design-implementation.md) - 실제 구현 방법

### 🛠 기능별 가이드
- [결제 시스템 가이드](./payment-system-guide.md) - 결제 기능 구현
- [회원 관리 디자인](./member-management-design.md) - 회원 시스템
- [상품 관리 개선](./product-management-enhancement.md) - 상품 기능

### 📋 개발 가이드
- [개발자 가이드](./DEVELOPER_GUIDE.md) - 개발 규칙 및 컨벤션
- [배포 가이드](./deployment_guide.md) - 프로덕션 배포 방법
- [프로젝트 계획](./project_plan.md) - 로드맵 및 일정

### 🗂 백업 문서
- [백업 (2025-05-30)](./backup_20250530/) - 이전 버전 문서
- [백업 (2025-06-01)](./backup_20250601/) - 오늘 백업된 문서

## 🔍 빠른 참조

### 주요 컴포넌트 위치
```
/components/
├── TeeTimeAssignmentManagerV2.tsx  # 티타임 배정 (성별 표시 포함)
├── ParticipantsManagerV2.tsx       # 참가자 관리
├── RoomAssignmentManager.tsx       # 객실 배정
└── Dashboard.tsx                   # 관리자 대시보드
```

### 중요 환경 변수
```bash
NEXT_PUBLIC_SUPABASE_URL      # Supabase API URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase 익명 키
GITHUB_TOKEN                  # GitHub API 토큰
```

### 유용한 명령어
```bash
npm run dev    # 개발 서버 실행
npm run build  # 프로덕션 빌드
npm start      # 빌드된 앱 실행
```

## 📞 문의
- 개발팀: MASLABS
- 프로젝트 URL: https://go.singsinggolf.kr

---
*최종 업데이트: 2025년 6월 1일*
