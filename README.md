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

#### 🔥 권장: Git 커밋 스크립트 사용
프로젝트에는 `git-commit.sh` 스크립트가 포함되어 있어 커밋과 배포를 자동화합니다.

```bash
# 실행 권한이 없을 경우
bash git-commit.sh

# 실행 권한이 있을 경우
./git-commit.sh
```

**스크립트 기능:**
- 변경된 파일 자동 확인
- 모든 변경사항 자동 스테이징
- 커밋 메시지 입력 프롬프트
- 자동 push 및 Vercel 배포 트리거
- 배포 URL 안내

#### 수동 배포
```bash
# 1. 변경사항 확인
git status

# 2. 파일 추가
git add .

# 3. 커밋
git commit -m "커밋 메시지"

# 4. 푸시 (자동 배포 트리거)
git push origin main

# 5. 강제 배포가 필요한 경우
vercel --prod
```

#### 배포 확인
- Production URL: https://go2.singsinggolf.kr
- Vercel Dashboard: https://vercel.com/taksoo-kims-projects/tsx-gallery-cursor

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
