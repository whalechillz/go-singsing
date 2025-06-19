#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 솔라피 SMS subject 필드 에러 수정 ===${NC}"

# Git 상태 확인
echo -e "${YELLOW}변경된 파일 확인 중...${NC}"
git status

# 파일 추가
echo -e "${YELLOW}변경사항 추가 중...${NC}"
git add .

# 커밋
echo -e "${YELLOW}커밋 중...${NC}"
git commit -m "fix: SMS 발송 시 subject 필드 제거

- 에러: 1011 subject 필드는 SMS에서 사용이 불가능
- SMS 타입일 때는 subject 필드를 포함하지 않도록 수정
- LMS, MMS일 때만 subject 필드 포함"

# 푸시
echo -e "${YELLOW}원격 저장소에 푸시 중...${NC}"
git push origin main

echo -e "${GREEN}✅ 수정 완료!${NC}"
echo -e "${BLUE}Vercel에서 자동 배포가 시작됩니다.${NC}"
echo -e "${BLUE}2-3분 후에 다시 테스트해보세요.${NC}"
