#!/bin/bash

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Git 상태 확인
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 Git Commit & Deploy${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 변경된 파일 확인
echo -e "${YELLOW}📋 변경된 파일:${NC}"
git status --short
echo ""

# 변경사항이 없으면 종료
if [[ -z $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  커밋할 변경사항이 없습니다.${NC}"
    exit 0
fi

# 모든 변경사항 추가
echo -e "${GREEN}📦 변경사항 추가 중...${NC}"
git add .

# 커밋 메시지 입력
echo -e "${CYAN}💬 커밋 메시지를 입력하세요:${NC}"
read -r COMMIT_MSG

# 메시지가 없으면 기본 메시지 사용
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: $(date +%Y-%m-%d\ %H:%M:%S)"
fi

# 커밋
echo -e "${GREEN}📝 커밋 중...${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 커밋 성공!${NC}"
    echo ""
    
    # Push
    echo -e "${GREEN}🔄 Push 중...${NC}"
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✨ 배포 완료!${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}📌 확인하기:${NC}"
        echo -e "   ${BLUE}https://go2.singsinggolf.kr${NC}"
        echo ""
    else
        echo -e "${RED}❌ Push 실패!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 커밋 실패!${NC}"
    exit 1
fi
