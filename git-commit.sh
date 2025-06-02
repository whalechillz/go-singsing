#!/bin/bash

# Git 변경사항 추가
git add .

# 커밋 메시지
git commit -m "feat: 문서별 하단 내용 관리 시스템 구현

- DocumentFooterManager 컴포넌트 추가
- document_footers 테이블 생성
- 일정 관리(통합)에 '문서 하단 내용' 탭 추가
- 각 문서별로 개별 하단 내용 관리 가능
  * 라운딩 시간표: 라운딩 주의사항
  * 탑승지 안내: 탑승 주의사항
  * 객실 배정: 객실 이용 안내, 식사 안내
  * 전체 일정표: 락카 이용 안내
- TourSchedulePreview에서 문서별 하단 내용 표시"

# Push to main branch
git push origin main

echo "✅ 커밋 및 푸시 완료!"