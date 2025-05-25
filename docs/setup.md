# 싱싱골프투어 개발 환경 설정 가이드

## 📋 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- Git

## 🚀 프로젝트 설정

### 1. 저장소 클론
```bash
git clone https://github.com/your-repo/go2.singsinggolf.kr.git
cd go2.singsinggolf.kr
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 입력합니다:

```env
# Supabase 설정 (필수)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# GitHub 설정 (선택사항)
GITHUB_TOKEN=your-github-token
REPO_OWNER=your-username
REPO_NAME=your-repo

# Postgres 직접 연결 (선택사항)
POSTGRES_HOST=db.your-project.supabase.co
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
```

### 4. 데이터베이스 마이그레이션
Supabase 대시보드에서 SQL 에디터를 열고 다음 순서로 마이그레이션을 실행합니다:

1. `supabase/migrations/` 디렉토리의 SQL 파일들을 날짜 순서대로 실행
2. 각 파일의 내용을 복사하여 SQL 에디터에서 실행

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🛠 개발 도구

### VS Code 추천 확장
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript React code snippets

### 디버깅
```bash
# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 빌드 테스트
npm run build
```

## 🎨 디자인 시스템

### 색상 팔레트 확인
개발 서버 실행 후 [http://localhost:3000/admin/color-test](http://localhost:3000/admin/color-test)에서 싱싱골프 색상 팔레트를 확인할 수 있습니다.

### 디자인 파일
- `/styles/colors.js` - 색상 정의
- `/styles/fonts.tsx` - 폰트 시스템
- `/docs/design-guide.md` - 디자인 가이드

## 📁 프로젝트 구조

```
go2.singsinggolf.kr/
├── app/                    # Next.js 페이지
├── components/             # React 컴포넌트
├── lib/                    # 유틸리티
├── styles/                 # 디자인 시스템
├── supabase/              # DB 설정
└── docs/                   # 문서
```

## 🔒 인증 설정

현재는 인증 시스템이 구현되어 있지 않습니다. 
추후 Supabase Auth를 활용한 인증 시스템 구현 예정입니다.

## ⚠️ 주의사항

1. **환경 변수**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
2. **API 키**: Supabase 키는 공개되지 않도록 주의하세요
3. **데이터베이스**: 프로덕션 DB 접근 시 주의하세요

## 🐛 문제 해결

### npm install 에러
```bash
# 캐시 삭제
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 빌드 에러
```bash
# .next 폴더 삭제
rm -rf .next

# 다시 빌드
npm run build
```

### 포트 충돌
기본 포트(3000)가 사용 중인 경우:
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

## 📞 지원

문제가 발생하면:
1. [프로젝트 이슈](https://github.com/your-repo/go2.singsinggolf.kr/issues) 확인
2. 새 이슈 생성
3. 관리자에게 문의: admin@singsinggolf.kr
