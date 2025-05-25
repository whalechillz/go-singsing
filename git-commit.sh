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
git commit -m "fix: TypeScript 타입 에러 수정 및 메뉴 구조 개선

- Supabase relation 쿼리에 any 타입 추가로 Vercel 빌드 에러 해결
- 메뉴 구조 변경: 전체 참가자 관리를 독립 메뉴로 분리
- 전체회원 관리는 향후 개발로 별도 구분
- 회원 관리 시스템 설계 문서 추가 (/docs/member-management-design.md)
- UI/UX 구조 문서 업데이트"

# 푸시
echo "원격 저장소에 푸시..."
git push

echo "완료!"