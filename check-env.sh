#!/bin/bash

echo "🔍 환경변수 확인"
echo "================="

if [ -f .env.local ]; then
  echo "✅ .env.local 파일 존재"
  echo ""
  echo "SOLAPI 관련 환경변수:"
  echo "-------------------"
  grep "SOLAPI_" .env.local | sed 's/=.*/=***/' || echo "SOLAPI 환경변수 없음"
  echo ""
  
  # PFID 확인
  if grep -q "SOLAPI_PFID" .env.local; then
    echo "✅ SOLAPI_PFID 설정됨"
    PFID=$(grep "SOLAPI_PFID" .env.local | cut -d'=' -f2)
    if [ "$PFID" = "KA01PF250616100116116JGCMFKunkh" ]; then
      echo "✅ PFID가 솔라피에 표시된 값과 일치"
    else
      echo "⚠️  PFID 불일치. 예상: KA01PF250616100116116JGCMFKunkh"
    fi
  else
    echo "❌ SOLAPI_PFID 누락"
  fi
else
  echo "❌ .env.local 파일 없음"
fi

echo ""
echo "Vercel 환경변수도 확인하세요:"
echo "1. https://vercel.com 로그인"
echo "2. 프로젝트 선택"
echo "3. Settings > Environment Variables"
echo "4. SOLAPI_PFID = KA01PF250616100116116JGCMFKunkh 확인"