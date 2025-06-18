#!/bin/bash
# chmod +x apply-marketing-migration.sh

# 마케팅 콘텐츠 마이그레이션 실행 스크립트

echo "🚀 마케팅 콘텐츠 테이블 마이그레이션 시작..."

# Supabase 프로젝트 URL과 API 키 확인
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ 환경 변수가 설정되지 않았습니다."
    echo "💡 .env.local 파일을 확인하세요."
    exit 1
fi

# 마이그레이션 파일 확인
MIGRATION_FILE="./supabase/migrations/add_marketing_content_tables.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ 마이그레이션 파일을 찾을 수 없습니다: $MIGRATION_FILE"
    exit 1
fi

echo "📄 마이그레이션 파일 발견: $MIGRATION_FILE"

# Supabase CLI 확인
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI가 설치되지 않았습니다."
    echo "💡 다음 명령어로 설치하세요: npm install -g supabase"
    exit 1
fi

# 마이그레이션 실행
echo "🔄 마이그레이션 실행 중..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ 마케팅 콘텐츠 테이블 생성 완료!"
    echo ""
    echo "📋 생성된 테이블:"
    echo "  - marketing_contents (마케팅 콘텐츠 마스터)"
    echo "  - marketing_included_items (포함/불포함 항목)"
    echo "  - marketing_special_benefits (특별혜택)"
    echo "  - marketing_icons (아이콘 관리)"
    echo ""
    echo "🎉 이제 마케팅 콘텐츠를 DB로 관리할 수 있습니다!"
else
    echo "❌ 마이그레이션 실행 중 오류가 발생했습니다."
    exit 1
fi
