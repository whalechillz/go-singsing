# 개발 환경 세팅 가이드

## 1. Node/NPM 설치
- Node.js LTS 버전 권장 (ex. 18.x)
- nvm 등 버전 관리 툴 사용 권장

## 2. 의존성 설치
```bash
npm install
```

## 3. Supabase CLI 설치
```bash
npm install -g supabase
```

## 4. 환경 변수 설정
- `.env.local` 파일 생성
- 예시:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
- Vercel 등 배포 환경에도 동일하게 설정

## 5. Supabase 프로젝트 초기화(최초 1회)
```bash
supabase init
```

## 6. 로컬 DB 마이그레이션 적용(옵션)
```bash
supabase db push
```

## 7. 개발 서버 실행
```bash
npm run dev
```

---
- 기타: GitHub 연동, Vercel 프로젝트 연결, 브랜치 전략 등은 별도 운영 정책 참고 