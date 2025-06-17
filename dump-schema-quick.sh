#!/bin/bash

# 빠른 스키마 덤프 (구조만, 데이터 제외)

echo "🚀 빠른 스키마 덤프 시작..."

# 현재 날짜
DATE=$(date +%Y%m%d_%H%M%S)

# 출력 파일
OUTPUT_FILE="docs/database/schema_quick_${DATE}.sql"
mkdir -p docs/database

# 스키마만 덤프 (--schema-only 옵션 사용)
echo "스키마 덤프 중... (데이터 제외)"
npx supabase db dump --schema public --schema-only > "$OUTPUT_FILE"

# 최신 버전으로 복사
cp "$OUTPUT_FILE" "docs/database/schema_current.sql"

echo "✅ 빠른 덤프 완료!"
echo "📁 파일: $OUTPUT_FILE"
echo "⏱️  훨씬 빠르게 완료됩니다!"
