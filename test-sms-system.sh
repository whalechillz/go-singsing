#!/bin/bash

echo "🧪 SMS 시스템 테스트 스크립트"
echo "================================"
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API 엔드포인트
API_BASE="http://localhost:3000/api/messages"

# 테스트 함수
test_api() {
  local endpoint=$1
  local description=$2
  local data=$3
  
  echo -e "${YELLOW}테스트:${NC} $description"
  echo "엔드포인트: $endpoint"
  echo "요청 데이터: $data"
  
  response=$(curl -s -X POST "$API_BASE/$endpoint" \
    -H "Content-Type: application/json" \
    -d "$data")
  
  if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 성공${NC}"
  else
    echo -e "${RED}❌ 실패${NC}"
    echo "응답: $response"
  fi
  echo ""
}

echo "1. 환경 변수 확인"
echo "-----------------"
if [ -f ".env.local" ]; then
  echo "✅ .env.local 파일 존재"
  echo "SMS 관련 환경 변수:"
  grep -E "SOLAPI_" .env.local | sed 's/=.*/=***/'
else
  echo "❌ .env.local 파일이 없습니다."
fi
echo ""

echo "2. API 테스트 시작"
echo "-----------------"
echo "⚠️  실제 SMS가 발송됩니다. 테스트 전화번호를 사용하세요!"
echo ""

# 2-1. 포털 문서 발송 테스트
test_api "send-document" "포털 문서 발송 (SMS)" '{
  "tourId": "test-tour-id",
  "documentIds": ["doc1"],
  "participantIds": ["participant1"],
  "sendMethod": "sms",
  "documentUrl": "https://go.singsinggolf.kr/portal/test123",
  "messageTemplate": "[싱싱골프] #{이름}님, 투어 포털을 확인해주세요: https://go.singsinggolf.kr/portal/#{url}"
}'

# 2-2. 개별 문서 발송 테스트
test_api "send-document" "개별 문서 발송 (SMS)" '{
  "tourId": "test-tour-id",
  "documentIds": ["doc2"],
  "participantIds": ["participant1"],
  "sendMethod": "sms",
  "documentUrl": "https://go.singsinggolf.kr/s/doc456",
  "messageTemplate": "[싱싱골프] #{이름}님, 투어 문서를 확인해주세요: https://go.singsinggolf.kr/s/#{url}"
}'

# 2-3. 견적서 발송 테스트
test_api "send-quote" "견적서 발송 (SMS)" '{
  "quoteId": "quote-id",
  "customerPhone": "010-1234-5678",
  "customerName": "테스트고객",
  "sendMethod": "sms"
}'

# 2-4. 결제 안내 발송 테스트
test_api "send-payment" "계약금 요청 발송 (SMS)" '{
  "tourId": "test-tour-id",
  "participantIds": ["participant1"],
  "messageType": "deposit_request",
  "sendMethod": "sms"
}'

# 2-5. 고객 관리 발송 테스트
test_api "send-customer" "고객 안내 발송 (SMS)" '{
  "customerIds": ["customer1"],
  "sendType": "REMINDER",
  "sendMethod": "sms",
  "templateData": {
    "reminderText": "다음 주 투어 일정을 확인해 주세요"
  }
}'

echo ""
echo "3. 테스트 완료"
echo "--------------"
echo "위 테스트 결과를 확인하고 필요시 다음을 점검하세요:"
echo "  - 환경 변수 설정"
echo "  - 데이터베이스 연결"
echo "  - 전화번호 형식"
echo "  - 템플릿 내용"