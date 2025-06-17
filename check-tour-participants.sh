#!/bin/bash

echo "=== 투어 참가자 수 불일치 문제 확인 ==="

# 1. tsx가 없으면 설치
if ! command -v tsx &> /dev/null; then
    echo "1. tsx 설치 중..."
    npm install --save-dev tsx
fi

# 2. 투어별 참가자 수 확인
echo -e "\n2. 투어별 참가자 수 확인 중..."
npm run check-tours

echo -e "\n=== 확인 완료 ==="
echo "위 결과를 확인하세요. 레코드 수와 그룹 인원수 합계가 다르면 문제가 있는 것입니다."
