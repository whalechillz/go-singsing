# 싱싱골프투어 Favicon 가이드

## 현재 파비콘 시스템

Next.js App Router는 다음 파일들을 자동으로 파비콘으로 인식합니다:

1. `/app/icon.tsx` - 32x32 기본 파비콘 (골프공 디자인)
2. `/app/apple-icon.tsx` - 180x180 Apple Touch Icon
3. `/app/opengraph-image.tsx` - 1200x630 소셜 미디어 공유 이미지

## 파비콘 디자인

- **배경색**: #003366 (싱싱골프투어 브랜드 컬러)
- **전경색**: 흰색 골프공 with 회색 딤플
- **텍스트**: "싱" (apple-icon에만 포함)

## 수동 파비콘 생성 방법

정사각형 PNG 파일이 필요한 경우:

1. https://realfavicongenerator.net/ 방문
2. `/public/singsing_square_logo.svg` 업로드
3. 다양한 크기의 PNG 생성
4. favicon.ico 파일 다운로드 후 `/app/favicon.ico`로 저장

## 현재 사용 중인 파일들

- `/public/singsing_square_logo.svg` - 정사각형 로고 (512x512)
- `/public/singsing_logo_192x192.png` - PWA 아이콘
- `/public/singsing_logo_180x180.png` - Apple Touch Icon (백업)

## 주의사항

- Vercel 환경에서는 자동으로 favicon을 생성하므로 `/app/icon.tsx`를 우선 사용
- 개발 환경에서는 캐시로 인해 즉시 반영되지 않을 수 있음
- 강제 새로고침: Ctrl+Shift+R (Windows) 또는 Cmd+Shift+R (Mac)