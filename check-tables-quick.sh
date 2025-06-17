#!/bin/bash

# 테이블 목록만 빠르게 확인

echo "📋 테이블 목록 빠른 조회..."

# Supabase SQL 에디터에서 실행할 쿼리
cat > temp_table_query.sql << 'EOF'
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
EOF

echo "아래 쿼리를 Supabase SQL Editor에서 실행하세요:"
echo "----------------------------------------"
cat temp_table_query.sql
echo "----------------------------------------"

# 임시 파일 삭제
rm temp_table_query.sql

echo ""
echo "💡 팁: Supabase Dashboard > SQL Editor에서"
echo "   위 쿼리를 실행하면 즉시 테이블 목록을 볼 수 있습니다!"
