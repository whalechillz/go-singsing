#!/bin/bash

# Git 상태 확인
echo "===== Git Status ====="
git status

# 변경사항 확인
echo -e "\n===== Git Diff ====="
git diff --stat

# 변경사항 추가
echo -e "\n===== Adding changes ====="
git add .

# 커밋
echo -e "\n===== Committing ====="
git commit -m "feat: 참가자 관리 개선
- 엑셀 템플릿에 직책 필드 추가 (기본값: 총무)
- 파일명에 투어명 포함
- 간단 입력 기능 추가 (탭 구분 텍스트 붙여넣기)
- 출발시간 필드 제거 (DB 스키마에 없음)"

# 커밋 결과 확인
echo -e "\n===== Latest commit ====="
git log -1 --oneline