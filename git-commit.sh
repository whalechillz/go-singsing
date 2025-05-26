#!/bin/bash

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리로 이동
cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# Git 상태 확인
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 Git Commit & Deploy Helper${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 현재 브랜치 표시
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${PURPLE}🌿 현재 브랜치: ${GREEN}$CURRENT_BRANCH${NC}"
echo ""

# Git 상태 확인
echo -e "${YELLOW}📋 변경된 파일 목록:${NC}"
git status --short
echo ""

# 변경사항이 있는지 확인
if [[ -z $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  커밋할 변경사항이 없습니다.${NC}"
    exit 0
fi

# 커밋 메시지 입력
echo -e "${CYAN}💬 커밋 메시지를 입력하세요 (기본값: 참가자-결제 연동 기능 추가):${NC}"
read -r COMMIT_MSG

# 기본 메시지 설정
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="feat: 참가자 목록에 결제 상태 표시 기능 추가

- 참가자 목록에서 결제 완료/미결제 상태 확인 가능
- 결제 상태별 필터링 기능 추가
- 결제 현황 통계 표시
- 일괄결제 표시 기능 포함"
fi

# 자동 수정 옵션
echo ""
echo -e "${CYAN}🔧 자동으로 ParticipantsManagerV2.tsx를 수정하시겠습니까? (y/N):${NC}"
read -r AUTO_FIX

if [[ "$AUTO_FIX" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✨ 파일 수정 중...${NC}"
    
    # 백업 생성
    cp components/ParticipantsManagerV2.tsx components/ParticipantsManagerV2.tsx.backup
    
    # TODO: 여기에 실제 파일 수정 로직 추가
    echo -e "${YELLOW}⚠️  수동으로 ParticipantsManagerV2.tsx 파일을 수정해주세요.${NC}"
    echo -e "${YELLOW}   참고: artifacts에서 생성된 코드를 사용하세요.${NC}"
fi

# Git add
echo ""
echo -e "${GREEN}📦 변경사항 스테이징...${NC}"
git add -A

# 스테이징된 파일 표시
echo -e "${CYAN}스테이징된 파일:${NC}"
git diff --cached --name-only
echo ""

# 커밋
echo -e "${GREEN}📝 커밋 중...${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 커밋 성공!${NC}"
else
    echo -e "${RED}❌ 커밋 실패!${NC}"
    exit 1
fi

# Push 여부 확인
echo ""
echo -e "${CYAN}🚀 원격 저장소에 Push 하시겠습니까? (y/N):${NC}"
read -r PUSH_CONFIRM

if [[ "$PUSH_CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🔄 Push 중...${NC}"
    git push origin "$CURRENT_BRANCH"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Push 성공!${NC}"
        echo ""
        
        # Vercel 배포 상태 확인
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}🎉 Vercel 자동 배포가 시작되었습니다!${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}📌 배포 상태 확인:${NC}"
        echo -e "   ${BLUE}https://vercel.com/dashboard${NC}"
        echo ""
        echo -e "${YELLOW}📌 배포 완료 후 확인:${NC}"
        echo -e "   ${BLUE}https://go2.singsinggolf.kr${NC}"
        echo ""
        
        # 최근 커밋 로그 표시
        echo -e "${PURPLE}📜 최근 커밋 내역:${NC}"
        git log --oneline -5
        
    else
        echo -e "${RED}❌ Push 실패!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⏭️  Push를 건너뛰었습니다.${NC}"
    echo -e "${YELLOW}   나중에 'git push origin $CURRENT_BRANCH' 명령으로 Push할 수 있습니다.${NC}"
fi

echo ""
echo -e "${GREEN}✨ 작업 완료!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
