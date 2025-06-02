#!/bin/bash

# Git 변경사항 추가
git add .

# 커밋 메시지
git commit -m "fix: 투어 스케줄 관리 6개 문서 미리보기 오류 수정

- 실제 존재하는 테이블명으로 변경 (tour_daily_schedules → singsing_schedules)
- tour_product_id로 여행상품 연결
- singsing_tee_times, singsing_participants 테이블 구조에 맞게 수정
- document_notices 테이블 조회 일시 비활성화
- 객실 배정표, 티타임표 HTML 생성 로직 수정"

# Push to main branch
git push origin main

echo "✅ 커밋 및 푸시 완료!"