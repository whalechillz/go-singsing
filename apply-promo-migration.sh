#!/bin/bash

# 투어 홍보 페이지 마이그레이션 적용 스크립트

echo "🚀 투어 홍보 페이지 마이그레이션 적용"
echo ""
echo "이 스크립트는 tour_promotion_pages 테이블을 생성합니다."
echo ""
echo "Supabase 대시보드에서 아래 SQL을 실행하세요:"
echo ""
echo "1. https://supabase.com/dashboard 접속"
echo "2. 프로젝트 선택"
echo "3. SQL Editor 클릭"
echo "4. New Query 클릭"
echo "5. 아래 SQL 전체를 복사해서 붙여넣기:"
echo ""
echo "========================================"
echo ""

# 마이그레이션 파일 내용 출력
cat supabase/migrations/20250619_create_tour_promotion_tables.sql

echo ""
echo "========================================"
echo ""
echo "6. Run 버튼 클릭"
echo ""
echo "✅ 마이그레이션 완료 후 다음 명령어 실행:"
echo "   npm run dev"
echo ""
echo "📝 추가 확인사항:"
echo "   - 모든 투어에 대해 기본 홍보 페이지가 자동 생성됩니다"
echo "   - slug는 tour_id를 기반으로 생성됩니다"
echo "   - 이후 관리자 페이지에서 slug를 사용자 친화적으로 변경 가능합니다"
