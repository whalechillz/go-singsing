#!/bin/bash

# Git 커밋 및 푸시 스크립트

echo "🚀 싱싱골프 프로젝트 배포 시작..."

# 변경사항 추가
git add .

# 커밋 메시지 입력
if [ -z "$1" ]; then
    git commit -m "feat: 60대 여성 시니어 친화적 404 페이지 추가"
else
    git commit -m "$1"
fi

# GitHub에 푸시
git push origin main

echo "✅ GitHub 푸시 완료!"
echo "🔄 Vercel 자동 배포 진행 중..."
echo "📍 배포 URL: https://go.singsinggolf.kr/"
echo ""
echo "⏳ 몇 분 후 아래 주소에서 확인하세요:"
echo "   https://go.singsinggolf.kr/404"
