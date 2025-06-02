#!/bin/bash

# Git 변경사항 커밋 스크립트

echo "🚀 Git 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --short

# 모든 변경사항 추가
git add .

# 커밋 메시지
COMMIT_MSG="🔧 빌드 오류 수정: TeeTime 타입 호환성 문제 해결

수정사항:
- TeeTimeAssignmentManagerV2에서 date 속성 참조 제거
- play_date 속성만 사용하도록 수정
- 빌드 성공 확인"

# 커밋 실행
git commit -m "$COMMIT_MSG"

# 원격 저장소로 푸시
echo "📤 원격 저장소로 푸시 중..."
git push

echo "✅ 커밋 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
