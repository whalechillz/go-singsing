#!/bin/bash

echo "투어 마감 기능을 위한 마이그레이션 실행 중..."

# Supabase 마이그레이션 실행
npx supabase db push

echo "✅ 마이그레이션 완료!"
echo ""
echo "추가된 필드:"
echo "- current_participants: 현재 참가자 수 (자동 계산)"
echo "- is_closed: 마감 여부"
echo "- closed_reason: 마감 사유"
echo "- closed_at: 마감 일시"
echo ""
echo "6월 16일 투어를 마감하려면 관리자 페이지에서 설정하세요."
