#!/bin/bash

echo "🔄 티타임 관리 색상 제거 및 간소화 커밋..."

# Git 상태 확인
git status

# 변경된 파일 추가
git add components/TeeTimeSlotManager.tsx
git add components/TeeTimeAssignmentManagerV2.tsx
git add backup_files/

# 커밋 메시지
git commit -m "fix: 티타임 관리 색상 제거 및 코스명 간소화

- 하드코딩된 9가지 색상 완전 제거
- 모든 코스를 회색 톤으로 통일
- 코스명 간소화 (골프장명 - 코스명 → 코스명)
- 불필요한 백업 파일 정리"

# 푸시
git push origin main

echo "✅ 커밋 완료!"