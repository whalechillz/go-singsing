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
git commit -m "feat: 투어 참가자 관리 페이지 대폭 개선

- location 필드 제거 및 데이터 구조 정리
- 엑셀 업로드/다운로드 기능 강화
  - 템플릿 다운로드 기능 추가
  - 업로드 미리보기 및 유효성 검사
  - 중복 체크 기능
- 일괄 작업 기능 추가
  - 다중 선택 체크박스
  - 일괄 상태 변경, 편집, 삭제
- UI/UX 개선 및 데이터 검증 강화"

# 푸시
echo "원격 저장소에 푸시..."
git push

echo "완료!"