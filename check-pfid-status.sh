#!/bin/bash

echo "🔍 솔라피 PFID 확인"
echo "=================="

# .env.local에서 PFID 확인
if [ -f .env.local ]; then
  PFID=$(grep "SOLAPI_PFID" .env.local | cut -d'=' -f2)
  echo "현재 설정된 PFID: $PFID"
  echo ""
  echo "솔라피 대시보드에서 확인할 것:"
  echo "1. 카카오채널 관리 > 채널 목록"
  echo "2. 싱싱골프 채널의 PFID가 위와 동일한지"
  echo "3. 채널 상태가 '활성화'인지"
  echo ""
  echo "만약 PFID가 다르다면:"
  echo "1. 올바른 PFID로 .env.local 수정"
  echo "2. Vercel 환경변수도 수정"
fi