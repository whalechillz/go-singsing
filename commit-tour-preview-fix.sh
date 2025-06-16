#!/bin/bash

# 변경사항 추가
git add components/tour/TourSchedulePreview.tsx
git add supabase/add_tour_features_fields.sql
git add docs/TOUR_SCHEDULE_PREVIEW_UPDATE.md

# 커밋
git commit -m "fix: TypeScript 타입 에러 수정 및 일정 엿보기 개선

- filter 함수의 word 파라미터에 string 타입 명시
- 레이아웃 여백 개선
- 탑승 장소 정보 동적 처리
- 포함/불포함 사항 데이터베이스 필드 추가 준비"

echo "커밋이 완료되었습니다."
