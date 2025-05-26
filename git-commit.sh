#!/bin/bash

cd /Users/prowhale/MASLABS/go2.singsinggolf.kr

# Git 상태 확인
echo "📋 변경사항:"
git status --short
echo ""

# 변경사항 추가
git add .

# 커밋
git commit -m "fix: PaymentManager 타입 에러 수정

🐛 빌드 에러 수정:
- Participant 인터페이스에 tour_id 속성 추가
- Vercel 빌드 실패 문제 해결"

# 푸시
echo ""
echo "🚀 Push 중..."
git push

echo "✅ 완료!"
