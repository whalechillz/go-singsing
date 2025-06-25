#!/bin/bash

echo "🔄 개발 서버 재시작 스크립트"
echo "=========================="

# .next 캐시 삭제
echo "📦 캐시 삭제 중..."
rm -rf .next

# node_modules/.cache 삭제 (있는 경우)
if [ -d "node_modules/.cache" ]; then
    echo "🗑️  node_modules 캐시 삭제 중..."
    rm -rf node_modules/.cache
fi

echo ""
echo "✅ 캐시 삭제 완료!"
echo ""
echo "이제 다음 명령어를 실행하세요:"
echo "npm run dev"
echo ""
echo "환경변수가 제대로 로드되었는지 확인하려면:"
echo "콘솔에 'Kakao SDK initialized' 메시지가 나오는지 확인하세요."
