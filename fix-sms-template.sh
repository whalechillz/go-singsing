#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SMS 템플릿 제목 문제 수정 ===${NC}"

# Git 상태 확인
echo -e "${YELLOW}변경된 파일 확인 중...${NC}"
git status

# 파일 추가
echo -e "${YELLOW}변경사항 추가 중...${NC}"
git add .

# 커밋
echo -e "${YELLOW}커밋 중...${NC}"
git commit -m "fix: SMS 템플릿 선택 시 제목 필드 제거

- 템플릿 선택 시 SMS 타입이면 제목을 설정하지 않음
- 메시지 타입을 SMS로 변경하면 자동으로 제목 제거
- API 호출 시 SMS는 빈 제목으로 전송
- 에러 해결: 1011 subject 필드는 SMS에서 사용이 불가능"

# 푸시
echo -e "${YELLOW}원격 저장소에 푸시 중...${NC}"
git push origin main

echo -e "${GREEN}✅ 수정 완료!${NC}"
echo -e "${BLUE}Vercel에서 자동 배포가 시작됩니다.${NC}"
echo -e ""
echo -e "${GREEN}테스트 방법:${NC}"
echo -e "1. 템플릿 선택 → SMS 템플릿 선택"
echo -e "2. 또는 직접 입력 → SMS 선택 → 메시지만 입력"
echo -e "3. 메시지 발송 클릭"
echo -e ""
echo -e "${BLUE}이제 성공해야 합니다! 🎉${NC}"
