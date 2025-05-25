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
git commit -m "fix: 메뉴 개선 및 햄버거 메뉴 토글 버그 수정

- 여행상품 등록/수정 페이지 문구 통일
- 햄버거 메뉴 토글 버그 수정
- 통계, 설정 메뉴 임시 비활성화"

# 푸시
echo "원격 저장소에 푸시..."
git push

echo "완료!"