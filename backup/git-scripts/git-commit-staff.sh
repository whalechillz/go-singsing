#!/bin/bash

# Git 변경사항 커밋 스크립트

echo "🎨 스탭용 탑승안내서 디자인 개선..."

# 변경사항 확인
echo "📋 변경된 파일:"
git status --short

# 모든 변경사항 추가
git add .

# 커밋 메시지
COMMIT_MSG="feat: 스탭용 탑승안내서 B그룹 디자인 적용 및 팀별 정렬 추가

주요 변경사항:
1. 🎨 스탭용 탑승안내서 B그룹 디자인 적용
   - 기존 #2c5282 (A그룹) → #4a6fa5 (B그룹) 색상 변경
   - 디자인 시스템 operational.header 사용
   - 헤더에 border-radius 추가로 일관성 유지

2. ✅ 팀별 정렬 기능 추가
   - 탑승지별 → 팀별 → 이름순으로 3차 정렬
   - 각 탑승지 내에서 팀별로 그룹화하여 표시
   - 팀별 인원수 표시로 가독성 향상

3. 📊 비고 필드 설명
   - singsing_participants 테이블의 notes 필드에서 데이터 가져옴
   - 참가자별 특이사항 기록용

4. 🎨 스타일 개선
   - team-section 클래스 추가
   - 팀 제목(h4) 스타일링 추가
   - 들여쓰기로 계층 구조 명확히 표현"

# 커밋 실행
git commit -m "$COMMIT_MSG"

# 원격 저장소로 푸시
echo "📤 원격 저장소로 푸시 중..."
git push

echo "✅ 스탭용 탑승안내서 개선 완료!"
echo "🌐 Vercel에서 자동 배포가 시작됩니다..."
