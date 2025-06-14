#!/bin/bash

echo "Next.js 캐시 및 빌드 파일 정리 중..."

# .next 폴더 삭제
rm -rf .next

# node_modules/.cache 삭제
rm -rf node_modules/.cache

# 빌드 다시 실행
echo "다시 빌드 중..."
npm run build

echo "완료! 이제 npm run dev로 실행하세요."
