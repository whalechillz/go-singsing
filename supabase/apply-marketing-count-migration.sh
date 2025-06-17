#!/bin/bash

echo "========================================"
echo "마케팅 표시 인원 기능 추가 마이그레이션"
echo "========================================"

# 현재 디렉토리 확인
cd "$(dirname "$0")"

# Supabase 프로젝트 ID 확인
echo ""
echo "1. Supabase 대시보드에 로그인하세요"
echo "2. Settings → API → Project URL에서 프로젝트 ID를 확인하세요"
echo "3. 아래 SQL을 SQL Editor에서 실행하세요:"
echo ""
echo "----------------------------------------"
cat pending_migrations/add_marketing_participant_count.sql
echo ""
echo "----------------------------------------"
echo ""
echo "마이그레이션 실행 후:"
echo "1. 관리자 페이지 → 투어 관리 → 각 투어의 '수정' 클릭"
echo "2. '참가자 수 관리' 섹션에서 '마케팅 표시 인원' 설정"
echo "3. 실제 참가자 수와 다르게 설정 가능 (예: 실제 16명 → 표시 20명)"
echo ""
echo "변경사항:"
echo "- 데이터베이스: marketing_participant_count 필드 추가"
echo "- 투어 수정 페이지: 마케팅 표시 인원 설정 UI 추가"
echo "- 고객용 페이지: 마케팅 표시 인원 우선 표시"
echo ""
