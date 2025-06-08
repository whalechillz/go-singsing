#!/bin/bash

# 싱싱골프 데이터베이스 스키마 덤프 스크립트
# 실행: ./scripts/dump-schema.sh

echo "🔄 싱싱골프 데이터베이스 스키마 덤프 시작..."

# 날짜 변수
DATE=$(date +%Y%m%d)
DATETIME=$(date +"%Y-%m-%d %H:%M:%S")

# 디렉토리 확인 및 생성
mkdir -p docs/database

# 1. 최신 스키마 덤프 (schema-latest.sql)
echo "📝 최신 스키마 추출 중..."
supabase db dump --schema-only -f docs/database/schema-latest.sql

# 2. 날짜별 백업 생성
echo "📅 날짜별 백업 생성 중..."
supabase db dump --schema-only -f docs/database/schema-${DATE}.sql

# 3. README.md 업데이트
echo "📄 README.md 업데이트 중..."
cat > docs/database/README-schema-update.md << EOF
### 🔧 스키마 업데이트 이력

**최종 업데이트**: ${DATETIME}

#### 최신 스키마 파일
- \`schema-latest.sql\` - 현재 데이터베이스 전체 스키마
- \`schema-${DATE}.sql\` - ${DATE} 백업

EOF

# 4. 테이블별 구조 문서 생성
echo "📊 테이블별 문서 생성 중..."
mkdir -p docs/database/tables

# 5. 성공 메시지
echo "✅ 스키마 덤프 완료!"
echo "📁 저장 위치:"
echo "   - docs/database/schema-latest.sql"
echo "   - docs/database/schema-${DATE}.sql"
echo ""
echo "💡 팁: 다음 명령어로 스키마 확인 가능:"
echo "   cat docs/database/schema-latest.sql | less"
