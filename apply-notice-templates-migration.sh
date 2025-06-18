#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 공지사항 템플릿 시스템 마이그레이션 시작...${NC}"

# Supabase 프로젝트 정보
SUPABASE_PROJECT_REF="eeqfdjmtzwsljrqxlemtz"
SUPABASE_DB_URL="postgresql://postgres.eeqfdjmtzwsljrqxlemtz:Thaksgodqkr78@!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# 마이그레이션 파일 경로
MIGRATION_FILE="./supabase/migrations/20250618_create_notice_templates.sql"

# 마이그레이션 실행
echo -e "${GREEN}📋 공지사항 템플릿 테이블 생성 중...${NC}"

# psql 명령어로 직접 실행
if command -v psql &> /dev/null; then
    psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 마이그레이션 성공!${NC}"
        echo -e "${GREEN}📌 생성된 테이블: notice_templates${NC}"
        echo -e "${GREEN}📌 샘플 템플릿 4개 추가됨${NC}"
        echo ""
        echo -e "${YELLOW}다음 단계:${NC}"
        echo "1. 관리자 페이지에서 '공지사항 템플릿' 메뉴 확인"
        echo "2. 문서 링크 관리에서 특별공지사항 입력 시 '템플릿' 버튼 사용"
        echo "3. 메시지 발송 시 '공지 템플릿' 버튼으로 템플릿 활용"
    else
        echo -e "${RED}❌ 마이그레이션 실패${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ psql이 설치되어 있지 않습니다.${NC}"
    echo -e "${YELLOW}다음 명령어로 설치하세요:${NC}"
    echo "  Mac: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo -e "${GREEN}✨ 공지사항 템플릿 시스템 설치 완료!${NC}"
