#!/bin/bash

# Git 변경사항 커밋 스크립트

echo "🎨 디자인 시스템 적용 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --short

# 모든 변경사항 추가
git add .

# 커밋 메시지
COMMIT_MSG="feat: 싱싱골프투어 브랜드 디자인 시스템 구축 및 적용

주요 변경사항:
1. 🎨 브랜드 디자인 시스템 구축
   - /design-system 디렉토리 생성
   - brand-colors.ts: TypeScript 색상 정의
   - brand-colors.css: CSS 변수 정의
   - README.md: 디자인 시스템 가이드라인

2. 🎨 브랜드 색상 체계 정의
   - A그룹 (계약 문서): #2c5282 - 진한 파란색, 권위감
   - B그룹 (실행 문서): #4a6fa5 - 연한 파란색, 친근감

3. ✅ TourSchedulePreview 컴포넌트에 디자인 시스템 적용
   - 하드코딩된 색상을 디자인 시스템 변수로 교체
   - 고객용 일정표: contractual.header 사용
   - 탑승안내서: operational.header 사용

4. 🔧 빌드 오류 수정
   - Storybook 관련 파일 백업 폴더로 이동
   - TypeScript 빌드 오류 해결"

# 커밋 실행
git commit -m "$COMMIT_MSG"

# 원격 저장소로 푸시
echo "📤 원격 저장소로 푸시 중..."
git push

echo "✅ 디자인 시스템 적용 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
