#!/bin/bash

# 마이그레이션 실행 스크립트
echo "투어 필드 마이그레이션을 실행합니다..."

# Supabase CLI를 사용하여 마이그레이션 실행
npx supabase db push

# 실행 결과 확인
if [ $? -eq 0 ]; then
    echo "✅ 마이그레이션이 성공적으로 완료되었습니다."
    echo ""
    echo "추가된 필드들:"
    echo "- current_participants (실제 참가자 수)"
    echo "- marketing_participant_count (마케팅 표시 인원)"
    echo "- is_closed, closed_reason, closed_at (마감 관련)"
    echo "- departure_location, itinerary, included_items, notes (일정 관련)"
    echo "- is_special_price, special_badge_text, badge_priority (뱃지 관련)"
    echo "- 문서 설정 및 전화번호 표시 설정"
    echo ""
    echo "⚠️  주의사항:"
    echo "1. 기존 투어의 marketing_participant_count는 current_participants로 초기화됩니다."
    echo "2. 일정 관련 필드들은 투어 수정 페이지에서 입력해야 합니다."
    echo "3. 일정 엿보기는 singsing_schedules 테이블을 사용합니다."
else
    echo "❌ 마이그레이션 실행 중 오류가 발생했습니다."
    exit 1
fi