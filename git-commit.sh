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
git commit -m "fix: 실제 사용되는 메뉴 컴포넌트 수정 및 TypeScript 에러 해결

- ModernAdminSidebar.tsx가 실제 사용되는 컴포넌트임을 확인
- 전체 참가자 관리를 독립 메뉴로 분리하고 하위 메뉴 추가
  - 참가자 목록
  - 결제 관리
- 서브메뉴 토글 기능 구현
- TypeScript any 타입 추가로 Vercel 빌드 에러 해결
- 삼선(햄버거 메뉴) 클릭 시 사이드바 접히는 기능 복구"

# 푸시
echo "원격 저장소에 푸시..."
git push

echo "완료!"