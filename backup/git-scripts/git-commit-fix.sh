#!/bin/bash

# Git 변경사항 커밋 스크립트

echo "🚀 Git 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --short

# 모든 변경사항 추가
git add .

# 커밋 메시지
COMMIT_MSG="fix: 고객용 일정표 락카 이용 정보 추가 및 빌드 에러 수정

주요 변경사항:
1. ✅ 고객용 일정표에 락카 이용 정보 추가
   - 상단 이용 안내 섹션에 락카 이용 항목 추가
   - 하단 이용 안내 섹션에 락카 이용 상세 정보 추가

2. ✅ 빌드 에러 수정
   - app/admin/tours/[tourId]/boarding/page.tsx 빈 파일 문제 해결
   - 기본 페이지 구조 추가하여 모듈 에러 수정"

# 커밋 실행
git commit -m "$COMMIT_MSG"

# 원격 저장소로 푸시
echo "📤 원격 저장소로 푸시 중..."
git push

echo "✅ 커밋 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
