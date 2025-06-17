#!/bin/bash

echo "=== 참가자 중복 확인 및 수정 스크립트 ==="

# 1. 필요한 패키지 설치
echo "1. 필요한 패키지 설치 중..."
npm install --save-dev tsx dotenv

# 2. 참가자 수 확인
echo -e "\n2. 참가자 수 불일치 확인 중..."
npm run check-participants

# 3. 중복 확인
echo -e "\n3. 중복 참가자 확인 중..."
npm run fix-duplicates

echo -e "\n=== 완료 ==="
echo "중복이 발견되면 다음 명령어로 정리하세요:"
echo "npm run fix-duplicates -- --confirm"
