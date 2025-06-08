#!/bin/bash

# Git 변경사항 커밋 스크립트

echo "🚀 Git 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --short

# 모든 변경사항 추가
git add .

# 커밋 메시지
COMMIT_MSG="refactor: 객실 배정 미리보기 기능 통합 및 중복 제거

주요 변경사항:
1. ✅ 객실 배정 스탭용 미리보기 기능 통합
   - RoomAssignmentManager에서 '내부용 미리보기' 버튼 제거
   - TourSchedulePreview의 '객실배정 (스탭용)' 메뉴로 기능 통합
   - RoomAssignmentPreview 컴포넌트 삭제

2. ✅ 중복 기능 제거
   - 미리보기 기능이 두 곳에 중복되어 있던 문제 해결
   - 통합된 문서 미리보기 시스템으로 일원화

3. 변경 이유
   - 모든 문서 미리보기를 한 곳에서 관리하여 유지보수 효율성 증대
   - 사용자 경험 개선: 여러 페이지를 오가지 않고 한 곳에서 모든 문서 확인 가능
   - 코드 중복 제거로 유지보수성 향상"

# 커밋 실행
git commit -m "$COMMIT_MSG"

# 원격 저장소로 푸시
echo "📤 원격 저장소로 푸시 중..."
git push

echo "✅ 커밋 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
