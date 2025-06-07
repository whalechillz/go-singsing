#!/bin/bash

# Git 상태 확인
echo "현재 Git 상태 확인..."
git status

# 변경사항 추가
echo "변경사항 추가..."
git add -A

# 커밋 메시지 작성
echo "커밋 생성..."
git commit -m "fix: Vercel 빌드 에러 수정 - 테스트 파일 제거

- TourSchedulePreview_render.tsx 파일 제거 (백업으로 이동)
- test-tee-time.ts 파일 제거 (백업으로 이동)
- 빌드 에러 해결"

# 푸시
echo "변경사항 푸시..."
git push origin main

echo "완료!"
