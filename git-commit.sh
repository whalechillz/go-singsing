#!/bin/bash

# Git 커밋 및 푸시
git add -A
git commit -m "fix: 참가자 관리 탑승지 드롭다운 오류 수정

- singsing_boarding_places 테이블에서 직접 데이터 가져오기
- 에러 처리 추가
- default_depart_time 필드 제거 (DB에 없는 필드)
- key를 id로 변경하여 React 경고 해결"
git push origin main

echo "커밋 및 푸시 완료!"
