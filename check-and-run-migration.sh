#!/bin/bash

# 안전한 마이그레이션 실행 스크립트

echo "🔍 이메일 템플릿 테이블 존재 여부 확인 중..."

# Supabase 프로젝트 URL과 Service Role Key가 필요합니다
# .env.local 파일에서 읽거나 직접 설정하세요
SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# 테이블 존재 여부 확인
CHECK_QUERY="SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_templates');"

# 실제로는 Supabase CLI나 직접 SQL Editor 사용을 권장
echo "다음 SQL을 Supabase SQL Editor에서 실행하여 확인하세요:"
echo ""
echo "$CHECK_QUERY"
echo ""
echo "결과가 false라면, 다음 파일의 내용을 실행하세요:"
echo "supabase/pending_migrations/20250114_email_templates.sql"
echo ""
echo "실행 후 다음 명령으로 기록하세요:"
echo "INSERT INTO migration_history (filename, executed_by) VALUES ('20250114_email_templates.sql', 'manual');"
