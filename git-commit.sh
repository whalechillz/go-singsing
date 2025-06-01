#!/bin/bash

# Git 커밋 및 푸시
git add -A
git commit -m "feat: 투어 문서 자동 생성 기능 구현

- TourSchedulePreview 컴포넌트에 문서 생성 기능 추가
- 4가지 문서 유형 지원:
  - 전체 일정표
  - 탑승 안내문 (고객용)
  - 탑승 안내문 (스탭용) - 참가자별 탑승지 정보 포함
  - 투어 일정표
- HTML 파일 다운로드 기능
- 인쇄 미리보기 및 인쇄 기능
- iframe을 통한 실시간 문서 미리보기"
git push origin main

echo "커밋 및 푸시 완료!"
