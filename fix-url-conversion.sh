#!/bin/bash

echo "🔧 URL 변환 로직 수정 시작..."

# send-document API 백업
echo "📁 백업 생성 중..."
BACKUP_FILE="app/api/messages/send-document/route.ts.backup.$(date +%Y%m%d_%H%M%S)"
cp app/api/messages/send-document/route.ts "$BACKUP_FILE"
echo "✅ 백업 파일 생성: $BACKUP_FILE"

# 수정할 파일 경로
FILE="app/api/messages/send-document/route.ts"

echo "🔄 URL 변환 로직 수정 중..."

# Node.js를 사용하여 파일 수정
node -e "
const fs = require('fs');
const content = fs.readFileSync('$FILE', 'utf8');

// URL 변환 로직 수정
const modifiedContent = content.replace(
  /\/\/ URL 경로를 \/s\/에서 \/portal\/로 변경[\s\S]*?https:\/\/go\.singsinggolf\.kr\/portal\/'\s*\);/,
  \`// URL 경로를 /portal/에서 /s/로 변경 (참가자용 공개 링크로 변환)
          personalizedContent = personalizedContent.replace(
            /https:\\\\/\\\\/go\\\\.singsinggolf\\\\.kr\\\\/portal\\\\//g,
            'https://go.singsinggolf.kr/s/'
          );\`
);

fs.writeFileSync('$FILE', modifiedContent);
console.log('✅ 파일 수정 완료');
"

echo ""
echo "📋 수정 내용 확인:"
grep -A 3 "URL 경로를" "$FILE" | head -10

echo ""
echo "✅ URL 변환 로직 수정 완료!"
echo ""
echo "📌 변경 내용:"
echo "  - /portal/ URL → /s/ URL로 변환하도록 수정"
echo "  - 관리자가 보는 통합 표지: /portal/uwbz2ans"
echo "  - 참가자가 받는 링크: /s/uwbz2ans"
echo ""
echo "🔍 다음 단계:"
echo "1. 서버 재시작: npm run dev"
echo "2. 테스트: 통합 표지 문서 발송 테스트"
echo ""
echo "💡 백업 파일: $BACKUP_FILE"