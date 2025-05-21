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

## 설치된 주요 라이브러리 목록 (2025-05-21 기준)

- **@radix-ui/react-dialog**: 모달(팝업) 창을 쉽게 만들 수 있는 UI 컴포넌트. 예) 참가자 정보 입력, 안내창 등.
- **@radix-ui/react-popover**: 버튼 클릭 시 작은 말풍선(레이어) 형태로 부가 정보를 띄우는 컴포넌트. 예) 멀티 셀렉트, 옵션 선택 등.
- **@supabase/supabase-js**: Supabase(클라우드 DB)와 데이터를 주고받는 라이브러리. 예) 참가자, 티오프, 객실 등 DB 연동.
- **@tailwindcss/postcss**: TailwindCSS를 사용할 때 필요한 CSS 전처리 도구.
- **@tiptap/pm, @tiptap/react, @tiptap/starter-kit**: 리치 텍스트(에디터) 구현용. 예) 일정표, 안내문 등 입력.
- **@types/node, @types/react, @types/react-dom**: 타입스크립트에서 Node.js, React 관련 타입 지원.
- **autoprefixer**: CSS에 자동으로 브라우저별 접두사(-webkit- 등)를 붙여주는 도구.
- **clsx**: 여러 조건에 따라 CSS 클래스를 쉽게 조합할 수 있게 해주는 유틸.
- **cmdk**: 커맨드 팔레트(검색/자동완성 등) UI 구현용. 예) 참가자 검색, 옵션 선택 등.
- **eslint, eslint-config-next**: 코드 스타일/오류 자동 검사 도구. 협업 시 코드 품질 유지.
- **formidable**: 파일 업로드 등 폼 데이터 처리용. 예) 엑셀 업로드 등.
- **lucide-react**: 다양한 아이콘을 쉽게 사용할 수 있는 라이브러리. 예) 버튼, 안내 등.
- **next**: Next.js 프레임워크. React 기반의 SSR/CSR 웹앱 개발 핵심.
- **postcss**: CSS 전처리 도구. Tailwind 등과 함께 사용.
- **react, react-dom**: UI를 구성하는 핵심 라이브러리.
- **react-markdown**: 마크다운(.md) 문서를 HTML로 변환해 보여줌. 예) 안내문, 일정표 등.
- **react-syntax-highlighter**: 코드 블록에 색상 하이라이트 적용. 예) 문서 내 코드 예시 등.
- **tailwind-merge**: TailwindCSS 클래스가 중복될 때 자동으로 병합해주는 유틸.
- **tailwindcss**: 유틸리티 기반 CSS 프레임워크. 빠르고 일관된 UI 스타일링.
- **tw-animate-css**: Tailwind에서 애니메이션 효과를 쉽게 적용.
- **typescript**: 자바스크립트에 타입을 추가해 오류를 줄이고, 코드 자동완성/검사 지원.
- **vaul**: 모달, 다이얼로그 등 UI를 쉽게 구현하는 라이브러리.
- **xlsx**: 엑셀 파일을 읽고 쓸 수 있게 해주는 라이브러리. 예) 참가자 명단 업로드/다운로드 등.

### shadcn/ui 관련
- shadcn/ui는 Radix UI, TailwindCSS, clsx, tailwind-merge 등과 조합해 "실무적이고 현대적인 UI 컴포넌트"를 빠르게 만들 수 있게 해줍니다.
- 예시: 참가자 멀티 셀렉트(자동완성+전체 리스트), 팝오버(옵션 선택), 커맨드 팔레트(검색) 등.
- 실제로는 shadcn/ui에서 제공하는 컴포넌트 소스를 직접 복사해 프로젝트에 포함시키는 방식입니다.

### extraneous(불필요) 패키지
- @emnapi/core, @emnapi/runtime, @emnapi/wasi-threads, @napi-rs/wasm-runtime, @tybys/wasm-util
  - 현재 코드에서 직접 사용하지 않으면 삭제 권장 (npm uninstall로 정리 가능)

---

> 실제 의존성은 항상 package.json 기준으로 관리되며, 이 문서는 협업/이관/초기 세팅 참고용입니다.

---
- 기타: GitHub 연동, Vercel 프로젝트 연결, 브랜치 전략 등은 별도 운영 정책 참고 