#!/bin/bash

# Git 변경사항 커밋 스크립트

echo "🚀 Git 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --short

# 모든 변경사항 추가
git add .

# 커밋 메시지
COMMIT_MSG="fix: 일정 관리에 식사 정보 입력 기능 추가

수정사항:
- IntegratedScheduleManager에 식사 정보 관리 기능 추가
- 조식/중식/석식 체크박스 및 메뉴 입력 필드 추가
- 일정 목록에서 식사 정보 표시 (O/X 및 메뉴)
- 문서 미리보기에서 식사 정보가 정상적으로 표시되도록 수정

해결된 문제:
- 고객용 일정표에서 조식/중식/석식이 모두 X로 표시되던 문제
- 메뉴가 표시되지 않던 문제"

# 커밋 실행
git commit -m "$COMMIT_MSG"

# 원격 저장소로 푸시
echo "📤 원격 저장소로 푸시 중..."
git push

echo "✅ 커밋 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
