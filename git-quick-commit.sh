#!/bin/bash

# Git 빠른 커밋 스크립트
# 사용법: ./git-quick-commit.sh "커밋 메시지"

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# 인자 확인
if [ -z "$1" ]; then
    echo -e "${RED}❌ 사용법: ./git-quick-commit.sh \"커밋 메시지\"${NC}"
    exit 1
fi

# 변경사항 확인
if [[ -z $(git status -s) ]]; then
    echo -e "${RED}❌ 커밋할 변경사항이 없습니다.${NC}"
    exit 0
fi

# 자동으로 feat 타입으로 커밋
git add .
git commit -m "feat: $1"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 커밋 완료: feat: $1${NC}"
    
    # 자동 push
    current_branch=$(git branch --show-current)
    git push origin $current_branch
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Push 완료!${NC}"
    fi
fi
