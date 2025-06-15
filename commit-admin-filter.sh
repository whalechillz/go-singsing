#!/bin/bash

# Git 커밋 스크립트 - 관리자 페이지 예약 가능 투어 필터 추가

echo "🚀 관리자 페이지 개선 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --porcelain

# 스테이징
echo "📦 파일 스테이징 중..."
git add components/admin/tours/TourListEnhanced.tsx
git add app/page.tsx
git add commit-participant-auth.sh

# 커밋
echo "💾 커밋 생성 중..."
git commit -m "feat: 관리자 페이지에 예약 가능한 투어 필터 추가

- 검색바 옆에 '예약 가능한 투어만' 토글 스위치 추가
- 예약이 가능한 투어만 필터링하는 기능 구현
- 상태가 upcoming/ongoing이고 자리가 있는 투어만 표시
- 다른 필터들과 함께 사용 가능"

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
