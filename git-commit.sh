#!/bin/bash

# Git 변경사항 커밋 스크립트

echo "🚀 Git 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --short

# 모든 변경사항 추가
git add .

# 커밋 메시지
COMMIT_MSG="🔧 여행상품 이용안내 표시 및 입력폼 개선

수정사항:
1. ✅ 고객일정표에 여행상품 이용안내 표시
   - general_notices가 있으면 우선 표시
   - 없으면 usage_* 필드들을 이용안내로 표시
   - productData 안전하게 처리

2. ✅ 여행상품 입력폼 레이아웃 개선
   - 코스명 입력 필드를 골프장 정보 섹션 아래로 이동
   - 더 논리적인 입력 순서로 변경"

# 커밋 실행
git commit -m "$COMMIT_MSG"

# 원격 저장소로 푸시
echo "📤 원격 저장소로 푸시 중..."
git push

echo "✅ 커밋 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
