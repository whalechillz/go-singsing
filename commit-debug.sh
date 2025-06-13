#!/bin/bash

# Git 커밋 및 푸시 스크립트

echo "📦 Committing login debugging..."

# 변경사항 추가
git add .

# 커밋
git commit -m "debug: 로그인 문제 디버깅 로그 추가"

# 푸시
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Complete!"
