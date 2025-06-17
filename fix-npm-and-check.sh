#!/bin/bash

echo "=== NPM 캐시 정리 및 참가자 중복 확인 ==="

# 1. npm 캐시 정리
echo "1. NPM 캐시 정리 중..."
npm cache clean --force

# 2. node_modules 삭제 및 재설치
echo -e "\n2. node_modules 재설치 중..."
rm -rf node_modules package-lock.json
npm install

# 3. tsx 직접 설치
echo -e "\n3. tsx 설치 중..."
npm install --save-dev tsx@latest dotenv@latest

# 4. tsx가 설치되었는지 확인
echo -e "\n4. tsx 설치 확인..."
npx tsx --version

# 5. 직접 스크립트 실행
echo -e "\n5. 참가자 수 확인 스크립트 실행..."
npx tsx scripts/debug/check-participant-count.ts

echo -e "\n=== 완료 ==="
