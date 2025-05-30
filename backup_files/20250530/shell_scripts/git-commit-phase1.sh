#!/bin/bash

# Git add all changes
git add .

# Commit with message
git commit -m "feat: 관리자 UI/UX 개선 Phase 1

- 투어 스케줄 관리 페이지 개선
  - 통계 카드 추가 (예정/진행중/완료 투어 수, 예상 수익)
  - 검색 및 필터 기능 추가
  - 투어 상태 표시 (예정/진행중/완료/취소)
  - 참가자 수 및 진행률 표시
  - 드롭다운 액션 메뉴 추가

- 여행상품 관리 페이지 개선
  - 그리드/리스트 뷰 모드 전환
  - 상품 카드 UI 개선 (이미지, 평점, 태그 표시)
  - 통계 카드 추가 (전체/활성 상품, 총 예약, 평균 가격)
  - 검색 및 카테고리 필터 추가
  - 상품 상태 표시 (활성/비활성)

- Next.js 이미지 설정 추가
"

# Push to remote
git push origin main

echo "✅ Git 커밋 및 푸시 완료!"
echo "📦 Vercel 자동 배포가 시작됩니다..."
echo "🔗 배포 상태: https://vercel.com/dashboard"