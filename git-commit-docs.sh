#!/bin/bash

# Git 변경사항 커밋 스크립트

echo "🚀 Git 커밋 시작..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --short

# 모든 변경사항 추가
git add .

# 커밋 메시지
COMMIT_MSG="feat: 문서 미리보기 객실 배정표 개선

주요 변경사항:
1. ✅ TourSchedulePreview 객실 배정표 수정
   - generateRoomAssignmentHTML 함수 시그니처 변경
   - rooms와 tourStaff 매개변수 추가
   - RoomAssignmentManager와 동일한 카드 형식 UI 적용

2. ✅ 객실 표시 개선
   - 빈 객실도 '빈 객실'로 표시
   - 기사님 객실 별도 노란색 카드로 구분
   - 객실 번호/순서에 따른 정렬

3. ✅ 요약 정보 추가
   - 총 객실 수, 배정 인원, 미배정 인원 표시
   - 스타일 전면 개선 (카드 레이아웃, 호버 효과)

4. ✅ 문서 일관성
   - 모든 4개 문서 형식 통일
   - 고객용/스탭용 구분 명확화
   - 반응형 디자인 및 인쇄 최적화"

# 커밋 실행
git commit -m "$COMMIT_MSG"

# 원격 저장소로 푸시
echo "📤 원격 저장소로 푸시 중..."
git push

echo "✅ 커밋 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
