#!/bin/bash

# 빠른 참가자-결제 연동 커밋 스크립트
# 사용법: ./quick-payment-integration-commit.sh

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

echo "🚀 참가자-결제 연동 기능 커밋 중..."

# Git add
git add components/ParticipantsManagerV2.tsx

# 커밋
git commit -m "feat: 참가자 목록에 결제 상태 표시 기능 추가

- 참가자 목록에서 결제 완료/미결제 상태 확인 가능
- 결제 상태별 필터링 기능 추가 (결제완료/미결제 탭)
- 결제 현황 통계 표시 (결제율 포함)
- 일괄결제 표시 기능 포함
- 테이블에 결제상태 컬럼 추가"

# Push
git push origin main

echo "✅ 커밋 및 배포 완료!"
echo "📌 Vercel에서 자동 배포가 진행됩니다."
echo "🔗 https://go2.singsinggolf.kr 에서 확인하세요."
