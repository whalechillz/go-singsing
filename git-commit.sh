#!/bin/bash

# Git 커밋 및 푸시
git add -A
git commit -m "feat: 투어별 탑승 시간 관리 기능 추가

- TourBoardingTimeManager 컴포넌트 신규 개발
- 투어-탑승지별 시간 설정 가능
- 참가자 추가 시 자동으로 탑승 시간 조회/입력
- 투어 관리 페이지에 '탑승 시간 설정' 탭 추가
- 하이브리드 방식 구현 (기본값 자동, 개별 수정 가능)"
git push origin main

echo "커밋 및 푸시 완료!"
