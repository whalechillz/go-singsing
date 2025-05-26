# 싱싱골프투어 프로젝트 문서

## 📋 프로젝트 개요
싱싱골프투어 관리 시스템 - 투어 일정, 참가자, 객실, 문서를 통합 관리하는 웹 애플리케이션

## 🛠 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **배포**: Vercel
- **버전관리**: Git, GitHub

## 📁 프로젝트 구조
```
go2.singsinggolf.kr/
├── app/                # Next.js 14 App Router
├── components/         # React 컴포넌트
├── lib/               # 유틸리티 함수
├── styles/            # 전역 스타일
├── supabase/          # DB 마이그레이션
└── docs/              # 프로젝트 문서
```

## 🚀 빠른 시작

### 1. 개발 환경 설정
```bash
# 저장소 클론
git clone [repository-url]
cd go2.singsinggolf.kr

# 의존성 설치
npm install

# 환경 변수 설정 (.env.local)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key

# 개발 서버 실행
npm run dev
```

### 2. 배포
```bash
# Git 커밋 헬퍼 사용
./git-commit.sh

# 또는 수동 배포
git add .
git commit -m "커밋 메시지"
git push origin main
```

## 📅 개발 히스토리 (2025년 5월)

### 주요 기능 구현
- ✅ 투어 관리 시스템
- ✅ 참가자 관리 (엑셀 업로드/다운로드)
- ✅ 객실 배정 관리
- ✅ 문서 자동 생성 (투어 일정표, 탑승 안내문 등)
- ✅ 결제 관리 통합
- ✅ 티오프 시간 관리

### 최근 업데이트 (2025-05-27)
- 참가자-결제 연동 기능 개선
- 일괄결제 표시 로직 최적화
- UI/UX 통일성 개선
- 프로젝트 문서 정리

## 📞 문의
- 이메일: admin@singsinggolf.kr
- 개발팀: dev@singsinggolf.kr
