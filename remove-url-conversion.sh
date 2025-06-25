#!/bin/bash

echo "🔧 URL 변환 로직 제거 시작..."

# send-document API 백업
echo "📁 백업 생성 중..."
BACKUP_FILE="app/api/messages/send-document/route.ts.backup.$(date +%Y%m%d_%H%M%S)"
cp app/api/messages/send-document/route.ts "$BACKUP_FILE"
echo "✅ 백업 파일 생성: $BACKUP_FILE"

# 수정할 파일 경로
FILE="app/api/messages/send-document/route.ts"

echo "🔄 URL 변환 로직 제거 중..."

# sed를 사용하여 URL 변환 로직 제거 (주석 처리)
sed -i '' '/\/\/ URL 경로를 \/s\/에서 \/portal\/로 변경/,/);/s/^/\/\/ /' "$FILE"

echo ""
echo "📋 수정 내용 확인:"
echo "URL 변환 로직이 주석 처리되었습니다."

echo ""
echo "✅ URL 변환 로직 제거 완료!"
echo ""
echo "📌 변경 내용:"
echo "  - URL 변환 로직 제거"
echo "  - 포털 문서는 /portal/ 그대로 발송"
echo "  - 개별 문서는 /s/ 그대로 발송"
echo ""
echo "🔍 다음 단계:"
echo "1. 서버 재시작: npm run dev"
echo "2. 테스트:"
echo "   - 고객 포털 발송 테스트 (/portal/)"
echo "   - 개별 문서 발송 테스트 (/s/)"
echo ""
echo "💡 백업 파일: $BACKUP_FILE"