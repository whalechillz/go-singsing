#!/bin/bash

# Git에 변경사항 추가
git add components/TeeTimeAssignmentManagerV2.tsx

# 커밋
git commit -m "feat: 티타임 관리 UI 개선 및 고객용 미리보기 최적화

- 티타임 관리 페이지에서 코스별 배경색 추가 (파인:초록, 레이크:파랑, 힐스:주황 등)
- 고객용 미리보기에서 불필요한 정보 제거
  - 라운딩 주의사항 삭제
  - 회사 연락처, 골프장 예약실 삭제
  - 푸터 메시지 삭제
  - 기사님 연락처만 표시
- 모바일 최적화
  - 폰트 크기 축소
  - 여백 조정
  - 테이블 간소화"

echo "✅ 변경사항이 커밋되었습니다."
echo ""
echo "다음 명령어로 원격 저장소에 푸시하세요:"
echo "git push origin main"
