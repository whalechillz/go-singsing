#!/bin/bash

# Git 상태 확인 스크립트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

clear

echo -e "${BLUE}=== Git 저장소 상태 ===${NC}"
echo ""

# 현재 브랜치
current_branch=$(git branch --show-current)
echo -e "${CYAN}🌿 현재 브랜치:${NC} ${GREEN}$current_branch${NC}"

# 원격 저장소와 동기화 상태
git fetch --quiet
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null)
BASE=$(git merge-base @ @{u} 2>/dev/null)

if [ -z "$REMOTE" ]; then
    echo -e "${YELLOW}⚠️  원격 브랜치가 설정되지 않았습니다.${NC}"
elif [ $LOCAL = $REMOTE ]; then
    echo -e "${GREEN}✅ 원격 저장소와 동기화됨${NC}"
elif [ $LOCAL = $BASE ]; then
    echo -e "${YELLOW}⬇️  Pull이 필요합니다 (원격에 새 커밋 있음)${NC}"
elif [ $REMOTE = $BASE ]; then
    echo -e "${YELLOW}⬆️  Push가 필요합니다 (로컬에 새 커밋 있음)${NC}"
else
    echo -e "${RED}🔄 브랜치가 분기되었습니다 (merge 또는 rebase 필요)${NC}"
fi

echo ""

# 최근 커밋
echo -e "${PURPLE}📝 최근 커밋:${NC}"
git log --oneline -5 --graph --decorate
echo ""

# 변경사항
echo -e "${YELLOW}📋 작업 디렉토리 상태:${NC}"
if [[ -z $(git status -s) ]]; then
    echo -e "${GREEN}✨ 깨끗한 상태입니다.${NC}"
else
    git status -s
    echo ""
    
    # 변경된 파일 수 계산
    modified=$(git status -s | grep -c "^ M")
    added=$(git status -s | grep -c "^A")
    deleted=$(git status -s | grep -c "^ D")
    untracked=$(git status -s | grep -c "^??")
    
    echo -e "${CYAN}📊 요약:${NC}"
    [ $modified -gt 0 ] && echo -e "  수정됨: ${YELLOW}$modified${NC}개"
    [ $added -gt 0 ] && echo -e "  추가됨: ${GREEN}$added${NC}개"
    [ $deleted -gt 0 ] && echo -e "  삭제됨: ${RED}$deleted${NC}개"
    [ $untracked -gt 0 ] && echo -e "  추적안됨: ${PURPLE}$untracked${NC}개"
fi

echo ""

# Stash 확인
stash_count=$(git stash list | wc -l | tr -d ' ')
if [ $stash_count -gt 0 ]; then
    echo -e "${YELLOW}📦 Stash: $stash_count개${NC}"
    git stash list | head -3
    [ $stash_count -gt 3 ] && echo "  ..."
    echo ""
fi

# 브랜치 목록
echo -e "${CYAN}🌲 브랜치 목록:${NC}"
git branch -a | head -10
echo ""

echo -e "${BLUE}=== 끝 ===${NC}"
