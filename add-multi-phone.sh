#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 다중 전화번호 입력 기능 추가 ===${NC}"

# Git 상태 확인
echo -e "${YELLOW}변경된 파일 확인 중...${NC}"
git status

# 파일 추가
echo -e "${YELLOW}변경사항 추가 중...${NC}"
git add .

# 커밋
echo -e "${YELLOW}커밋 중...${NC}"
git commit -m "feat: 메시지 발송 시 다중 전화번호 입력 기능 추가

- 직접 입력 필드에 여러 번호를 쉼표로 구분하여 입력 가능
- 스탭진 일괄 발송 지원
- 예: 010-1234-5678, 010-2345-6789, 010-3456-7890"

# 푸시
echo -e "${YELLOW}원격 저장소에 푸시 중...${NC}"
git push origin main

echo -e "${GREEN}✅ 완료!${NC}"
