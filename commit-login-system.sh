#!/bin/bash

# Git 커밋 및 푸시 스크립트

echo "📦 Committing login system implementation..."

# 변경사항 추가
git add .

# 커밋
git commit -m "feat: 로그인 시스템 구현

- Supabase Auth 기반 인증 시스템 구축
- 기존 users 테이블과 active_users 뷰 활용
- 역할 기반 접근 제어 (admin/manager/staff)
- 로그인/로그아웃 기능 구현
- 미들웨어 제거하고 페이지 레벨 보호로 변경
- 테스트 계정 생성 SQL 스크립트 추가"

# 푸시
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Complete! Check your Vercel deployment."
