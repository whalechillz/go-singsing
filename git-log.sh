#!/bin/bash

# Git 로그 뷰어 스크립트

# 색상 정의
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

echo -e "${BLUE}=== Git 커밋 히스토리 ===${NC}"
echo ""

echo -e "${YELLOW}보기 옵션을 선택하세요:${NC}"
echo "1) 간단히 보기 (최근 20개)"
echo "2) 그래프로 보기"
echo "3) 상세히 보기"
echo "4) 특정 파일의 히스토리"
echo "5) 특정 작성자의 커밋"
echo "6) 날짜 범위로 검색"
echo "7) 커밋 메시지로 검색"

read -p "선택 [1-7]: " option

case $option in
    1)
        git log --oneline -20 --decorate --color
        ;;
    2)
        git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit -20
        ;;
    3)
        git log --stat -10 --color
        ;;
    4)
        read -p "파일 경로를 입력하세요: " filepath
        git log --follow --oneline -- "$filepath"
        ;;
    5)
        read -p "작성자 이름을 입력하세요: " author
        git log --author="$author" --oneline -20
        ;;
    6)
        read -p "시작 날짜 (YYYY-MM-DD): " since
        read -p "종료 날짜 (YYYY-MM-DD): " until
        git log --since="$since" --until="$until" --oneline
        ;;
    7)
        read -p "검색할 메시지: " message
        git log --grep="$message" --oneline
        ;;
    *)
        echo -e "${RED}❌ 잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac
