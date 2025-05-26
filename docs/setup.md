# 개발 환경 설정

## 필수 요구사항
- Node.js 18+
- Git

## 빠른 시작

### 1. 프로젝트 설정
```bash
# 클론
git clone [repository-url]
cd go2.singsinggolf.kr

# 설치
npm install
```

### 2. 환경 변수
`.env.local` 파일 생성:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### 3. 실행
```bash
npm run dev
```

## 주요 명령어

```bash
# 개발
npm run dev

# 빌드
npm run build

# 배포
./git-commit.sh
```

## 프로젝트 구조
```
/app          - 페이지
/components   - 컴포넌트
/lib          - 유틸리티
/styles       - 스타일
/supabase     - DB
```

## 문제 해결

### 포트 충돌
```bash
PORT=3001 npm run dev
```

### 캐시 문제
```bash
rm -rf .next node_modules
npm install
```
