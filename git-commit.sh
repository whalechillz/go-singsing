#!/bin/bash

# Git 변경사항 추가
git add .

# 커밋 메시지
git commit -m "fix: lucide-react 아이콘 오류 수정

- Golf 아이콘을 Flag로 변경
- Hotel 아이콘을 Building으로 변경
- Vercel 빌드 오류 해결"

# Push to main branch
git push origin main

echo "✅ 커밋 및 푸시 완료!"