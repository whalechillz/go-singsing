#!/bin/bash

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# Git 상태 확인
echo "Git 상태 확인..."
git status

# 변경사항 추가
echo "변경사항 추가..."
git add .

# 커밋
echo "커밋 실행..."
git commit -m "fix: 관리자 시스템 전체 구조 개선 및 빌드 에러 해결

- 메뉴 구조 재구성:
  - '투어 관리' 상위 메뉴 추가 (하위: 투어 스케줄 관리, 여행상품 관리, 탑승지 관리)
  - '전체 참가자 관리' 하위에 참가자 목록, 결제 관리 유지
  - '투어 상품 관리' → '여행상품 관리'로 문구 통일

- 페이지 연결 및 수정:
  - participants 페이지가 ParticipantsManagerV2 컴포넌트 사용
  - payments 페이지 추가 (개발 예정 안내)
  - boarding-places 페이지에 BoardingPlaceManager 컴포넌트 연결

- 구버전 컴포넌트 백업 처리:
  - AdminSidebarLayout.tsx, AdminSidebar.tsx
  - AdminLayout.tsx, AdminHeader.tsx, DashboardContent.tsx

- 문서 업데이트:
  - admin-structure.md: 관리자 시스템 구조 문서 작성
  - ui-ux-structure.md: UI/UX 구조 업데이트"

# 푸시
echo "원격 저장소에 푸시..."
git push

echo "완료!"