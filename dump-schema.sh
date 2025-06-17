#!/bin/bash

# 데이터베이스 스키마 덤프 스크립트
# 실행: ./dump-schema.sh

echo "📊 Supabase 데이터베이스 스키마 덤프 시작..."

# 현재 날짜
DATE=$(date +%Y%m%d)

# 출력 디렉토리
OUTPUT_DIR="docs/database"
mkdir -p $OUTPUT_DIR

# Supabase에서 스키마 덤프
echo "1. 스키마 덤프 중..."
npx supabase db dump --schema public > "$OUTPUT_DIR/schema_${DATE}.sql"

# 테이블 목록 생성
echo "2. 테이블 목록 생성 중..."
cat > "$OUTPUT_DIR/tables_list_${DATE}.md" << EOF
# 데이터베이스 테이블 목록
*생성일: $(date +"%Y-%m-%d %H:%M:%S")*

## 주요 뷰
- tour_with_auto_badges - 마케팅용 통합 뷰

## 핵심 테이블
- singsing_tours - 투어 기본 정보
- singsing_participants - 참가자 정보
- singsing_payments - 결제 정보
- singsing_schedules - 일정 정보
- singsing_rooms - 객실 정보
- singsing_tee_times - 티타임
- singsing_participant_tee_times - 참가자-티타임 매핑
- singsing_tour_staff - 스탭 정보

## 운영 테이블
- tour_journey_items - 일정 엿보기 항목
- tourist_attractions - 관광지/장소 정보
- tour_boarding_places - 탑승 정보
- singsing_boarding_places - 탑승 장소
- singsing_tour_boarding_times - 투어별 탑승 시간

## 상품 테이블
- tour_products - 투어 상품 템플릿

## 기타 테이블
- singsing_memo_templates - 메모 템플릿
- singsing_memos - 메모
- singsing_work_memos - 업무 메모
- documents - 문서
EOF

# 최신 스키마를 현재 스키마로 복사
cp "$OUTPUT_DIR/schema_${DATE}.sql" "$OUTPUT_DIR/schema_current.sql"
cp "$OUTPUT_DIR/tables_list_${DATE}.md" "$OUTPUT_DIR/tables_list_current.md"

echo "✅ 스키마 덤프 완료!"
echo "📁 파일 위치:"
echo "  - $OUTPUT_DIR/schema_${DATE}.sql"
echo "  - $OUTPUT_DIR/tables_list_${DATE}.md"
echo "  - $OUTPUT_DIR/schema_current.sql (최신)"
echo "  - $OUTPUT_DIR/tables_list_current.md (최신)"

# Git에 추가 (선택사항)
read -p "Git에 커밋하시겠습니까? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git add "$OUTPUT_DIR/*"
    git commit -m "docs: 데이터베이스 스키마 업데이트 ${DATE}"
    echo "✅ Git 커밋 완료!"
fi