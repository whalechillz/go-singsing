#!/bin/bash

# 싱싱골프 데이터베이스 분석 및 문서화 스크립트
# 실행: ./scripts/analyze-database.sh

echo "🔍 싱싱골프 데이터베이스 분석 시작..."

# Supabase SQL Editor에서 실행할 쿼리들을 생성
mkdir -p docs/database/analysis

# 1. 테이블 구조 분석 쿼리
cat > docs/database/analysis/table-structure.sql << 'EOF'
-- ================================================
-- 싱싱골프 데이터베이스 테이블 구조 분석
-- ================================================

-- 1. 전체 테이블 목록과 레코드 수
SELECT 
    schemaname,
    tablename,
    n_live_tup as "레코드수"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. 테이블별 컬럼 상세 정보
SELECT 
    table_name as "테이블",
    column_name as "컬럼명",
    data_type as "데이터타입",
    character_maximum_length as "최대길이",
    is_nullable as "NULL허용",
    column_default as "기본값"
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. 외래키 관계
SELECT
    tc.table_name as "테이블", 
    kcu.column_name as "컬럼", 
    ccu.table_name AS "참조테이블",
    ccu.column_name AS "참조컬럼" 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. 인덱스 정보
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
EOF

echo "✅ 분석 쿼리 생성 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. 스키마 덤프 실행:"
echo "   supabase db dump --schema-only -f docs/database/schema-latest.sql"
echo ""
echo "2. 분석 쿼리 실행:"
echo "   - Supabase SQL Editor에서 docs/database/analysis/table-structure.sql 내용 실행"
echo ""
echo "3. 결과를 docs/database/tables/ 폴더에 문서화"
