#!/bin/bash

echo "=== npm 캐시 및 tsx 문제 해결 ==="

# 1. npm 캐시 정리
echo "1. npm 캐시 정리 중..."
npm cache clean --force

# 2. tsx 설치 (전역 설치)
echo -e "\n2. tsx 전역 설치 중..."
npm install -g tsx

# 3. 또는 npx로 직접 실행
echo -e "\n3. 투어별 참가자 수 확인 중..."
npx tsx scripts/check-tour-participants.ts

echo -e "\n=== 완료 ==="
