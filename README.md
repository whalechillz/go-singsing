# 싱싱골프투어 관리 시스템

싱싱골프투어 예약 및 관리를 위한 통합 웹 애플리케이션입니다.

## 🏌️ 프로젝트 소개

60대 이상 여성을 주요 타겟으로 하는 프리미엄 골프 투어 서비스의 관리 시스템입니다.
투어 일정 관리, 참가자 관리, 객실 배정, 문서 생성 등 투어 운영에 필요한 모든 기능을 제공합니다.

## 🛠 기술 스택

- **Frontend**: Next.js 15.3.1, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Editor**: Tiptap
- **Deployment**: Vercel

## 🚀 시작하기

### 필수 조건

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/your-username/go2.singsinggolf.kr.git
cd go2.singsinggolf.kr
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Postgres DB (선택사항)
POSTGRES_HOST=your_db_host
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
go2.singsinggolf.kr/
├── app/                    # Next.js App Router
│   ├── (customer)/        # 고객용 페이지
│   ├── admin/             # 관리자 페이지
│   ├── document/          # 문서 관련 페이지
│   └── tour-schedule/     # 투어 일정 페이지
├── components/            # React 컴포넌트
│   ├── admin/            # 관리자용 컴포넌트
│   └── ui/               # UI 컴포넌트
├── lib/                   # 유틸리티 함수
├── styles/                # 디자인 시스템
│   ├── colors.tsx        # 색상 팔레트
│   └── fonts.tsx         # 폰트 시스템
├── supabase/              # Supabase 설정
│   └── migrations/        # DB 마이그레이션
└── docs/                  # 문서
```

## 🎯 주요 기능

### 1. 투어 관리
- 투어 일정 생성 및 관리
- 투어 상품 관리
- 일정별 세부 정보 설정

### 2. 참가자 관리
- 참가자 등록/수정/삭제
- 엑셀 업로드/다운로드
- 성별 구분 관리

### 3. 객실 배정
- 객실 타입 설정
- 참가자별 객실 배정
- 배정 현황 시각화

### 4. 티타임 관리
- 코스별 티타임 설정
- 조 편성 및 자동 배정
- 참가자 이동 관리

### 5. 문서 관리
- 탑승 안내문 생성
- 투어 일정표 생성
- 객실 배정표 생성
- 실시간 미리보기 및 프린트

### 6. 탑승 스케줄 관리
- 탑승지별 시간 설정
- 탑승 안내문 자동 생성

## 🎨 디자인 시스템

60대 이상 여성 사용자를 고려한 디자인:
- **폰트**: Noto Sans KR (가독성 최적화)
- **색상**: 네이비/골드 중심의 신뢰감 있는 색상
- **크기**: 큰 폰트와 넓은 터치 영역

자세한 내용은 [디자인 가이드](docs/design-guide.md)를 참고하세요.

## 📚 문서

- [프로젝트 계획](docs/project_plan.md)
- [UI/UX 구조](docs/ui-ux-structure.md)
- [디자인 가이드](docs/design-guide.md)
- [배포 가이드](docs/deployment_and_testing_guide.md)
- [DB 마이그레이션](docs/db_migration.md)

## 🚀 배포

Vercel을 통한 자동 배포:
```bash
git add .
git commit -m "your commit message"
git push origin main
```

main 브랜치에 푸시하면 Vercel이 자동으로 빌드 및 배포합니다.

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다. 무단 복제 및 배포를 금지합니다.

## 📞 문의

프로젝트 관련 문의사항은 아래로 연락주세요:
- Email: admin@singsinggolf.kr
- Website: [https://go2.singsinggolf.kr](https://go2.singsinggolf.kr)
