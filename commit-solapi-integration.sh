#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 솔라피 SMS API 연동 커밋 ===${NC}"

# Git 상태 확인
echo -e "${YELLOW}변경된 파일 확인 중...${NC}"
git status

# 파일 추가
echo -e "${YELLOW}변경사항 추가 중...${NC}"
git add .

# 커밋
echo -e "${YELLOW}커밋 중...${NC}"
git commit -m "feat: 알리고에서 솔라피로 SMS API 변경

- IP 제한 문제 해결을 위해 솔라피 API로 전환
- 솔라피 API 라우트 생성 (/api/solapi/send)
- 메시지 발송 페이지 업데이트
- 환경변수 추가 (SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER, SOLAPI_PFID)
- Vercel에서 바로 작동 가능"

# 푸시
echo -e "${YELLOW}원격 저장소에 푸시 중...${NC}"
git push origin main

echo -e "${GREEN}✅ 솔라피 API 연동 완료!${NC}"
echo -e "${BLUE}Vercel에서 자동 배포가 시작됩니다.${NC}"
echo -e "${BLUE}Vercel 환경변수도 추가하는 것을 잊지 마세요!${NC}"
