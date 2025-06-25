#!/bin/bash

echo "=== 견적서 메시지 발송 환경 변수 확인 ==="
echo ""

# .env.local 파일 존재 확인
if [ ! -f .env.local ]; then
    echo "❌ .env.local 파일이 없습니다!"
    echo "   .env.local.example을 복사하여 생성하세요:"
    echo "   cp .env.local.example .env.local"
    exit 1
fi

echo "✅ .env.local 파일 확인됨"
echo ""

# 필수 환경 변수 확인
echo "📋 필수 환경 변수 확인:"
echo "------------------------"

# Supabase 설정
if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local && ! grep -q "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" .env.local; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL 설정됨"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL 미설정"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local && ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" .env.local; then
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 설정됨"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 미설정"
fi

# Solapi 설정
if grep -q "SOLAPI_API_KEY=" .env.local && ! grep -q "SOLAPI_API_KEY=your_solapi_api_key" .env.local; then
    echo "✅ SOLAPI_API_KEY 설정됨"
else
    echo "❌ SOLAPI_API_KEY 미설정"
fi

if grep -q "SOLAPI_API_SECRET=" .env.local && ! grep -q "SOLAPI_API_SECRET=your_solapi_api_secret" .env.local; then
    echo "✅ SOLAPI_API_SECRET 설정됨"
else
    echo "❌ SOLAPI_API_SECRET 미설정"
fi

if grep -q "SOLAPI_SENDER=" .env.local; then
    SENDER=$(grep "SOLAPI_SENDER=" .env.local | cut -d'=' -f2)
    echo "✅ SOLAPI_SENDER 설정됨: $SENDER"
else
    echo "❌ SOLAPI_SENDER 미설정"
fi

echo ""
echo "💡 팁:"
echo "- 환경 변수를 수정한 후에는 개발 서버를 재시작해야 합니다."
echo "- npm run dev 또는 yarn dev를 다시 실행하세요."
