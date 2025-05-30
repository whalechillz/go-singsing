#!/bin/bash

# 색상 설정
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 여행상품 관리 페이지 개선 배포${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Git 명령어 실행
git add app/admin/tour-products/page.tsx
git commit -m "feat: 여행상품 관리 페이지 개선

- ProductListSimple → ProductListEnhanced로 변경
- 통계 대시보드 추가 (전체 상품, 활성 상품, 총 예약, 평균 가격)
- 검색 및 필터링 기능 추가
- 그리드/리스트 뷰 전환 기능
- 카테고리별 필터 (국내/해외/패키지/맞춤형)
- 상품 이미지, 평점, 태그 표시
- 더 많은 데이터 필드 활용"

git push origin main

echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "${YELLOW}📌 확인: https://go2.singsinggolf.kr/admin/tour-products${NC}"
