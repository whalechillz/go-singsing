#!/bin/bash

# Git 커밋 및 푸시
git add -A
git commit -m "fix: 탑승지 안내 미리보기 새 DB 구조 반영

- pickup_location 이름 매칭 지원
- 고객용/스탭용 뷰 분리
- 출발/도착 시간 표시
- parking_info 필드 활용
- UI/UX 개선"
git push origin main

echo "커밋 및 푸시 완료!"
