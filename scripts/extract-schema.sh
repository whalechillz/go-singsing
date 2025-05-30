#!/bin/bash

# ================================================
# Supabase 데이터베이스 스키마 추출 스크립트
# ================================================

# 색상 설정
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}📊 Supabase 스키마 추출 도구${NC}"
echo -e "${BLUE}================================================${NC}"

# 날짜 설정
DATE=$(date +%Y%m%d)
DATETIME=$(date +"%Y-%m-%d %H:%M:%S")

# 경로 설정
SCHEMA_DIR="docs/database"
SUPABASE_DIR="supabase"

# 디렉토리 생성
mkdir -p $SCHEMA_DIR
mkdir -p $SUPABASE_DIR

echo -e "\n${YELLOW}1. Supabase CLI로 스키마 추출 중...${NC}"

# 스키마 추출 (구조만)
if command -v supabase &> /dev/null; then
    # 최신 스키마
    supabase db dump --schema-only -f $SCHEMA_DIR/schema-latest.sql
    echo -e "${GREEN}✅ 최신 스키마 저장: $SCHEMA_DIR/schema-latest.sql${NC}"
    
    # 날짜별 백업
    supabase db dump --schema-only -f $SCHEMA_DIR/schema-$DATE.sql
    echo -e "${GREEN}✅ 백업 스키마 저장: $SCHEMA_DIR/schema-$DATE.sql${NC}"
    
    # supabase 폴더에도 복사
    cp $SCHEMA_DIR/schema-latest.sql $SUPABASE_DIR/schema.sql
    echo -e "${GREEN}✅ Supabase 폴더 복사: $SUPABASE_DIR/schema.sql${NC}"
else
    echo -e "${RED}❌ Supabase CLI가 설치되지 않았습니다.${NC}"
    echo -e "${YELLOW}설치 명령어: npm install -g supabase${NC}"
fi

echo -e "\n${YELLOW}2. 스키마 문서 업데이트 중...${NC}"

# README 업데이트
if [ -f "$SCHEMA_DIR/README.md" ]; then
    # 최종 업데이트 날짜 변경
    sed -i.bak "s/최종 업데이트: .*/최종 업데이트: $(date +%Y-%m-%d)/" $SCHEMA_DIR/README.md
    rm $SCHEMA_DIR/README.md.bak
    echo -e "${GREEN}✅ README.md 업데이트 완료${NC}"
fi

echo -e "\n${YELLOW}3. Git 상태 확인${NC}"
git add $SCHEMA_DIR/
git status --short $SCHEMA_DIR/

echo -e "\n${BLUE}================================================${NC}"
echo -e "${GREEN}✨ 스키마 추출 완료!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}📁 생성된 파일:${NC}"
echo -e "  - $SCHEMA_DIR/schema-latest.sql"
echo -e "  - $SCHEMA_DIR/schema-$DATE.sql"
echo -e "  - $SUPABASE_DIR/schema.sql"
echo ""
echo -e "${YELLOW}💡 다음 단계:${NC}"
echo -e "  1. 생성된 스키마 파일 확인"
echo -e "  2. 필요시 ER 다이어그램 추가 (스크린샷)"
echo -e "  3. Git 커밋"
echo ""