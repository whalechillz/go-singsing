#!/bin/bash

# 견적서 메시지 템플릿 추가 마이그레이션 실행

echo "견적서 메시지 템플릿 마이그레이션을 실행합니다..."

# .env.local 파일에서 데이터베이스 정보 가져오기
source .env.local

# 마이그레이션 파일 경로
MIGRATION_FILE="supabase/migrations/20250625_add_quote_message_templates.sql"

# 마이그레이션 실행
psql "$DATABASE_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "✅ 견적서 메시지 템플릿이 성공적으로 추가되었습니다."
    echo ""
    echo "추가된 템플릿:"
    echo "1. 견적서 발송 (SMS)"
    echo "2. 견적서 알림톡 (카카오톡)"
    echo ""
    echo "⚠️  주의사항:"
    echo "- 카카오 알림톡을 사용하려면 카카오 비즈니스에서 템플릿 승인이 필요합니다."
    echo "- 승인 후 message_templates 테이블의 kakao_template_code를 업데이트해주세요."
else
    echo "❌ 마이그레이션 실행 중 오류가 발생했습니다."
fi
