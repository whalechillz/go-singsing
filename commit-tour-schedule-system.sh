#!/bin/bash

# Git 커밋 스크립트 - 투어 일정표 자동 표시 시스템 및 관련 필드 추가

echo "🚀 투어 일정표 시스템 전체 구현 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --porcelain

# 스테이징
echo "📦 파일 스테이징 중..."
git add components/tour/TourScheduleDisplay.tsx
git add app/page.tsx
git add app/admin/tours/\[tourId\]/edit/page.tsx
git add app/admin/tours/new/page.tsx
git add supabase/add_tour_schedule_fields.sql
git add commit-tour-schedule-display.sh

# 커밋
echo "💾 커밋 생성 중..."
git commit -m "feat: 투어 일정표 자동 표시 시스템 전체 구현

자동 표시 시스템:
- TourScheduleDisplay 컴포넌트로 투어 일정 자동 표시
- document 경로 대신 데이터베이스에서 직접 표시
- 미리보기/전체보기 모드 지원

데이터베이스 필드 추가:
- departure_location: 출발 장소
- itinerary: 상세 일정
- included_items: 포함 사항
- notes: 기타 안내 사항

관리자 페이지 개선:
- 투어 생성/수정 페이지에 일정 관련 필드 추가
- 일정 정보 입력 및 관리 기능 구현"

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
