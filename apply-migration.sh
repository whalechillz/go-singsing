#!/bin/bash

# Supabase 프로젝트에 마이그레이션 적용하기

echo "📌 phone_display_settings 컬럼 추가를 위한 마이그레이션"
echo ""
echo "Supabase 대시보드에서 직접 실행하세요:"
echo ""
echo "1. https://supabase.com/dashboard 접속"
echo "2. 프로젝트 선택"
echo "3. SQL Editor 클릭"
echo "4. New Query 클릭"
echo "5. 아래 SQL 복사해서 붙여넣기:"
echo ""
echo "----------------------------------------"
cat supabase/migrations/20250613_add_phone_display_settings.sql
echo "----------------------------------------"
echo ""
echo "6. Run 버튼 클릭"
echo ""
echo "✅ 마이그레이션 완료 후 페이지를 새로고침하세요!"
