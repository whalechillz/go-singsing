#!/bin/bash
# chmod +x git-commit-boarding-enhanced.sh 실행 필요

# 여정 관리 기능 업데이트 스크립트

echo "🚀 여정 관리 기능 업데이트 시작..."

# 1. 변경사항 확인
echo "📋 변경사항 확인:"
git status

# 2. 변경사항 추가
echo "📝 변경사항 추가 중..."
git add components/BoardingPlaceManagerEnhanced.tsx
git add scripts/update_boarding_places_structure.sql

# 3. 커밋
echo "✅ 커밋 중..."
git commit -m "feat: 여정 관리 장소 유형별 필드 조건부 표시 구현

- place_type 필드 추가 (탑승지/휴게소/마트/관광지/맛집)
- 탑승지일 때만 버스 탑승 안내 필드 표시
- 장소 유형별 아이콘 및 필터 기능 추가
- 관광지는 기존 tourist_attractions 테이블과 연동"

# 4. 푸시
echo "🔄 원격 저장소에 푸시 중..."
git push

echo "✨ 여정 관리 기능 업데이트 완료!"
echo "📌 다음 단계:"
echo "   1. Vercel 배포 확인"
echo "   2. 여정 관리 페이지에서 기능 테스트"
echo "   3. 장소 유형별로 데이터 추가해보기"