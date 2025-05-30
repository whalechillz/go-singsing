#!/bin/bash

# 색상 설정
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 여행상품 관리 페이지 원복${NC}"
echo ""

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# Git 명령어 실행
git add app/admin/tour-products/page.tsx
git commit -m "fix: 여행상품 관리 페이지 DB 에러 수정

- description 컬럼 없음 에러 해결
- ProductListSimple로 원복
- Phase 2 마이그레이션 전 상태로 복구"

git push origin main

echo ""
echo -e "${GREEN}✅ 수정 완료!${NC}"
echo -e "${YELLOW}📌 확인: https://go2.singsinggolf.kr/admin/tour-products${NC}"
echo ""
echo -e "${RED}⚠️  참고: Enhanced 버전을 사용하려면 Phase 2 마이그레이션을 먼저 실행하세요.${NC}"
