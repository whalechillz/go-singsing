#!/bin/bash

# Git 커밋 및 푸시
git add -A
git commit -m "feat: 데이터베이스 구조 개선 및 통합 일정 관리 완성

- singsing_schedules 테이블에 day_number, schedule_items, boarding_info 컬럼 추가
- singsing_tour_staff 테이블 신규 생성
- boarding_guide_* 테이블 데이터를 기존 테이블로 마이그레이션
- tour_schedule_preview 뷰 생성으로 통합 조회 기능 구현
- 기존 테이블 백업 완료 (_backup_* 테이블)
- 통합 일정 관리 및 일정표 미리보기 기능 정상 작동"
git push origin main

echo "커밋 및 푸시 완료!"
