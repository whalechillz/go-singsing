#!/bin/bash

# 선택적 테이블 스키마 백업

echo "📊 주요 테이블 스키마 백업..."

DATE=$(date +%Y%m%d)
OUTPUT_DIR="docs/database/schema"
mkdir -p $OUTPUT_DIR

# 백업할 주요 테이블 목록
TABLES=(
    "singsing_tours"
    "singsing_participants"
    "tour_journey_items"
    "tourist_attractions"
    "tour_products"
)

# 각 테이블별로 스키마 덤프
for table in "${TABLES[@]}"
do
    echo "테이블 백업 중: $table"
    npx supabase db dump --schema public --data=false --table=$table > "$OUTPUT_DIR/${table}_${DATE}.sql"
done

echo "✅ 선택적 스키마 백업 완료!"
echo "📁 위치: $OUTPUT_DIR"
