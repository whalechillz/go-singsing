#!/bin/bash

# Git 커밋 스크립트 - 관리자 페이지 추가 기능 및 빌드 에러 수정

echo "🚀 관리자 페이지 추가 기능 구현 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --porcelain

# 스테이징
echo "📦 파일 스테이징 중..."
git add app/admin/users/sync-button.tsx
git add components/admin/tours/TourListEnhanced.tsx
git add commit-admin-filter.sh

# 커밋
echo "💾 커밋 생성 중..."
git commit -m "feat: 관리자 페이지 추가 기능 구현 및 빌드 에러 수정

빌드 에러 수정:
- sync-button.tsx 타입 에러 수정 (data -> count)

관리자 페이지 추가 기능:
- 예약 가능한 투어 개수 표시
- 빠른 필터 버튼 추가 (오늘 출발, 이번 주 출발, 마감 임박)
- 예약 가능 투어 상단 표시 옵션
- 예약 가능한 투어 시각적 구분 (초록색 배경 및 표시)"

echo "✅ 커밋 완료!"

# 푸시 여부 확인
read -p "원격 저장소에 푸시하시겠습니까? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 원격 저장소에 푸시 중..."
    git push
    echo "✅ 푸시 완료!"
else
    echo "⏸️  푸시를 건너뛰었습니다."
fi

echo "🎉 모든 작업이 완료되었습니다!"
