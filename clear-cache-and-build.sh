#!/bin/bash

echo "🧹 Next.js 캐시 정리 중..."

# .next 디렉토리 삭제
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ .next 디렉토리 삭제됨"
fi

# node_modules/.cache 디렉토리 삭제
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ node_modules/.cache 디렉토리 삭제됨"
fi

echo "🔨 프로젝트 다시 빌드 중..."
npm run build

echo "✅ 캐시 정리 및 빌드 완료!"