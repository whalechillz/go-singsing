#!/bin/bash

# 여정 관리 메뉴명 및 개선사항 커밋 스크립트

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🗺️  여정 관리 개선사항 커밋 준비 중...${NC}"

# 변경된 파일 확인
echo -e "\n${GREEN}변경된 파일:${NC}"
git status --short

# 스테이징
git add components/BoardingPlaceManagerEnhanced.tsx
git add components/JourneyManagement.tsx
git add app/admin/boarding-places/page.tsx
git add components/admin/ModernAdminLayout.tsx
git add components/admin/ModernAdminSidebar.tsx
git add supabase/migrations/add_journey_columns_to_boarding_places.sql
git add git-commit-journey.sh

# 커밋 메시지
COMMIT_MSG="feat: 여정 관리 시스템 개선 및 메뉴명 변경

- '탑승지 관리' 메뉴명을 '여정 관리'로 변경
- 타임라인 뷰 추가로 여정 순서 시각화
- 장소별 순서 관리 기능 추가
- 도착시간, 체류시간, 거리/소요시간 정보 추가
- 탑승지별 승객 수 관리 기능
- 통계 대시보드 추가
- 테이블/타임라인 뷰 전환 기능

BREAKING CHANGE: 데이터베이스 마이그레이션 필요
- order_index, arrival_time, stay_duration 등 새 컬럼 추가"

# 커밋 실행
echo -e "\n${YELLOW}커밋 메시지:${NC}"
echo "$COMMIT_MSG"
echo -e "\n${GREEN}커밋을 진행하시겠습니까? (y/n)${NC}"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ 커밋이 완료되었습니다!${NC}"
    
    echo -e "\n${YELLOW}원격 저장소에 푸시하시겠습니까? (y/n)${NC}"
    read -r push_response
    
    if [[ "$push_response" == "y" || "$push_response" == "Y" ]]; then
        git push
        echo -e "${GREEN}✅ 푸시가 완료되었습니다!${NC}"
    fi
else
    echo -e "${YELLOW}커밋이 취소되었습니다.${NC}"
fi
