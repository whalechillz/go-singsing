#!/bin/bash

# SMS 시스템 마이그레이션 스크립트
# 이 스크립트는 기존 SMS 발송 시스템을 통합 SMS 서비스로 마이그레이션합니다.

echo "🚀 SMS 시스템 마이그레이션 시작..."

# 1. SMS 서비스 파일 생성
echo "📁 SMS 서비스 파일 생성 중..."

mkdir -p lib/services

# SMS 서비스 파일이 이미 있는지 확인
if [ -f "lib/services/smsService.ts" ]; then
    echo "⚠️  SMS 서비스 파일이 이미 존재합니다. 백업을 생성합니다..."
    cp lib/services/smsService.ts lib/services/smsService.ts.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "✅ SMS 서비스 디렉토리 준비 완료"

# 2. 견적 관리 API 백업 및 수정
echo "📝 견적 관리 API 수정 중..."

# 백업 생성
if [ -f "app/api/messages/send-quote/route.ts" ]; then
    cp app/api/messages/send-quote/route.ts app/api/messages/send-quote/route.ts.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ 견적 관리 API 백업 완료"
fi

# 3. 고객 관리 API 디렉토리 생성
echo "👥 고객 관리 API 디렉토리 생성 중..."

mkdir -p app/api/messages/send-customer

echo "✅ 고객 관리 API 디렉토리 생성 완료"

# 4. 환경 변수 확인
echo "🔧 환경 변수 확인 중..."

if [ -f ".env.local" ]; then
    echo "📋 현재 설정된 SMS 관련 환경 변수:"
    grep -E "SOLAPI_|SMS_" .env.local | sed 's/=.*/=***/'
    
    echo ""
    echo "⚠️  다음 환경 변수가 설정되어 있는지 확인하세요:"
    echo "  - SOLAPI_API_KEY"
    echo "  - SOLAPI_API_SECRET"
    echo "  - SOLAPI_PFID"
    echo "  - SOLAPI_SENDER"
else
    echo "⚠️  .env.local 파일이 없습니다. 환경 변수를 설정해주세요."
fi

# 5. 마이그레이션 완료
echo ""
echo "✅ SMS 시스템 마이그레이션 준비 완료!"
echo ""
echo "📌 다음 단계:"
echo "1. 위의 아티팩트에서 제공된 코드들을 각 파일에 복사하세요:"
echo "   - unified-sms-sender → lib/services/smsService.ts"
echo "   - sms-api-examples의 견적서 발송 수정 → app/api/messages/send-quote/route.ts"
echo "   - sms-api-examples의 고객 관리 메시지 발송 → app/api/messages/send-customer/route.ts"
echo ""
echo "2. 환경 변수가 올바르게 설정되어 있는지 확인하세요"
echo "3. npm run dev로 개발 서버를 재시작하세요"
echo "4. 각 기능에서 SMS 발송을 테스트하세요"
echo ""
echo "💡 백업 파일들이 타임스탬프와 함께 생성되었습니다."