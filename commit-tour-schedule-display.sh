#!/bin/bash

# Git 커밋 스크립트 - 투어 일정표 자동 표시 시스템 구현

echo "🚀 투어 일정표 자동 표시 시스템 구현 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --porcelain

# 스테이징
echo "📦 파일 스테이징 중..."
git add components/tour/TourScheduleDisplay.tsx
git add app/page.tsx
git add commit-admin-enhancements.sh

# 커밋
echo "💾 커밋 생성 중..."
git commit -m "feat: 투어 일정표 자동 표시 시스템 구현

- TourScheduleDisplay 컴포넌트 생성
- 데이터베이스에서 직접 투어 정보를 가져와 표시
- 미리보기/전체보기 모드 지원
- document 경로 대신 컴포넌트 기반 표시
- 비참가자는 미리보기, 참가자는 전체 일정 표시"

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
