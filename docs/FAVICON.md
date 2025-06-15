# 싱싱골프투어 파비콘 시스템

## 파일 구조

```
/app
├── icon.tsx              # 32x32 브라우저 파비콘 (자동 생성)
├── apple-icon.tsx        # 180x180 Apple Touch Icon (자동 생성)
├── opengraph-image.tsx   # 1200x630 소셜 미디어 공유 이미지
└── (dev)                 # 개발용 페이지 (URL에 노출되지 않음)
    ├── favicon-preview/  # 512x512 파비콘 미리보기 API
    └── favicon-showcase/ # 파비콘 쇼케이스 페이지

/public
├── favicon/              # 파비콘 관련 정적 파일
│   ├── singsing_square_logo.svg     # 정사각형 로고 SVG
│   ├── singsing_logo_192x192.png    # PWA 아이콘
│   └── singsing_logo_180x180.png    # Apple Touch Icon (백업)
├── singsing_logo.svg     # 메인 로고 (가로형)
└── manifest.json         # PWA 매니페스트
```

## 파비콘 확인 방법

### 개발 환경
1. `npm run dev` 실행
2. 쇼케이스 페이지 방문: http://localhost:3000/favicon-showcase
3. 개별 아이콘 직접 확인:
   - http://localhost:3000/icon (32x32)
   - http://localhost:3000/apple-icon (180x180)
   - http://localhost:3000/favicon-preview (512x512)

### 프로덕션 환경
- Vercel 배포 시 자동으로 파비콘 생성 및 최적화
- 브라우저 탭에서 골프공 아이콘 확인 가능

## 디자인 스펙

- **브랜드 컬러**: #003366 (남색)
- **아이콘 디자인**: 흰색 골프공 + 회색 딤플
- **텍스트**: "싱" (큰 버전에만 포함)
- **형태**: 둥근 모서리 정사각형

## 주의사항

1. Next.js App Router는 `/app/icon.tsx`를 자동으로 파비콘으로 인식
2. 캐시로 인해 개발 환경에서 즉시 반영되지 않을 수 있음
3. 강제 새로고침: Ctrl+Shift+R (Windows) 또는 Cmd+Shift+R (Mac)

## 업데이트 방법

파비콘 디자인 변경 시:
1. `/app/icon.tsx` 파일의 JSX 코드 수정
2. `/app/apple-icon.tsx` 파일도 함께 수정
3. 필요시 `/public/favicon/` 폴더의 PNG 파일 재생성