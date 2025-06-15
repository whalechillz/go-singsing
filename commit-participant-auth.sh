#!/bin/bash

# Git 커밋 스크립트 - 투어 참가자 권한 및 전화번호 개선

echo "🚀 투어 참가자 권한 및 전화번호 개선 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --porcelain

# 스테이징
echo "📦 파일 스테이징 중..."
git add app/page.tsx
git add commit-guest-view-improvement.sh

# 커밋
echo "💾 커밋 생성 중..."
git commit -m "feat: 투어 참가자 권한 체크 및 전화번호 개선

- 로그인 사용자도 해당 투어 참가자가 아니면 일정표만 표시
- tour_participants 테이블에서 참가자 확인 로직 추가
- 전화번호를 회사번호(031-215-3990)로 통일
- 비로그인 사용자를 위한 하단 로그인 유도 메시지 추가
- 참가자별 차별화된 안내 메시지 제공"

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
