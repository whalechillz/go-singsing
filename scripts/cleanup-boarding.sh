#!/bin/bash

echo "탑승지 관련 파일 정리 시작..."

# 디렉토리 삭제
if [ -d "app/admin/boarding-places" ]; then
    rm -rf app/admin/boarding-places
    echo "✅ app/admin/boarding-places 디렉토리 삭제됨"
fi

# 컴포넌트 삭제
if [ -f "components/BoardingPlaceManager.tsx" ]; then
    rm components/BoardingPlaceManager.tsx
    echo "✅ BoardingPlaceManager.tsx 삭제됨"
fi

if [ -f "components/BoardingPlaceManagerEnhanced.tsx" ]; then
    rm components/BoardingPlaceManagerEnhanced.tsx
    echo "✅ BoardingPlaceManagerEnhanced.tsx 삭제됨"
fi

echo "정리 완료!"
