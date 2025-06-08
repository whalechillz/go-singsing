#!/bin/bash

# Git에 변경사항 추가
git add components/TeeTimeAssignmentManagerV2.tsx

# 커밋
git commit -m "feat: 티타임 미리보기를 라운딩 시간표 형식으로 개선

- 【파인】【힐스】 등 중복 태그 제거
- rounding-timetable.html 스타일 적용
- 코스별로 별도 테이블로 구분
- 조 구성(남성팀/여성팀/혼성팀) 표시 추가
- 참가자를 한 줄에 표시하여 가독성 향상
- 라운딩 주의사항 및 연락처 정보 추가
- 싱싱골프투어 로고 추가"

echo "✅ 변경사항이 커밋되었습니다."
echo ""
echo "다음 명령어로 원격 저장소에 푸시하세요:"
echo "git push origin main"
