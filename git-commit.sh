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
git commit -m "refactor: 관리자 대시보드 구조 개선

- AdminLayout, AdminSidebar, AdminHeader 컴포넌트로 분리
- DashboardContent 컴포넌트 생성
- 프로페셔널한 컴포넌트 구조 적용
- UI/UX 개선 및 반응형 디자인 강화"

# 푸시
echo "원격 저장소에 푸시..."
git push

echo "완료!"