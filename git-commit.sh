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
git commit -m "fix: 관리자 페이지 레이아웃 수정 및 빌드 에러 해결

- participants 페이지가 ParticipantsManagerV2 컴포넌트를 사용하도록 수정
- payments 페이지 추가 (개발 예정 안내 포함)
- 사용하지 않는 구버전 컴포넌트 모두 백업 처리
  - AdminSidebarLayout.tsx → .backup
  - AdminSidebar.tsx → .backup  
  - AdminLayout.tsx → .backup
  - AdminHeader.tsx → .backup
  - DashboardContent.tsx → .backup
- ModernAdminLayout에 결제 관리 페이지 제목 추가
- 관리자 시스템 구조 문서 작성
- 빌드 에러 해결"

# 푸시
echo "원격 저장소에 푸시..."
git push

echo "완료!"