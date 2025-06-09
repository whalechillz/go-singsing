# 마이그레이션 히스토리

## 현재 상태 (2025-06-09)
- 마지막 적용: 20250609_cleanup_schedules_tables.sql ✅
- 총 테이블 수: 22개 (singsing_schedules 삭제)

## 실행 완료 ✅
- ✅ 20250609_cleanup_schedules_tables.sql - singsing_schedules 테이블 삭제 완료

## 주요 변경사항
### 2025-06-09 ✅ 완료
- **singsing_schedules 테이블 삭제**
  - tour_journey_items 테이블로 완전 대체
  - 코드에서 singsing_schedules 참조 제거
  - 투어 기간에서 최대 일수 계산하도록 변경
### 2025-06-08 ✅ 완료
- **투어 관리 시스템 완전 재구조화**
  - tourist_attractions 테이블 확장
    - 새 카테고리 추가: mart, golf_round, club_meal, others
    - 새 컬럼 추가: sub_category, golf_course_info, meal_info, parking_info, entrance_fee, booking_required
  - tour_journey_items 테이블 생성 (투어별 여정 관리)
  - singsing_boarding_places 정리 (탑승지만 관리)
  - 스팟 관리 UI 전면 개편
  - 여정 관리 기능 추가 (타임라인/카테고리 뷰)
  - RLS 정책 및 트리거 설정

### 2025-06-06
- waypoint_type, image_url 추가 (singsing_tour_boarding_times)
- tourist_attractions 테이블 생성

### 2025-06-05
- accommodation 컬럼 추가

### 2025-06-04
- 역할 명확화
- 고객 데이터베이스
- 스태프 및 인증 시스템

### 2025-06-03
- 투어 뷰 생성
- 문서 시스템 개선
- 데이터베이스 최적화

### 2025-06-02
- 일정 구조 개선
- 공지사항 JSONB로 통합
- 탑승 테이블 통합

## 정리된 파일
- 중복 제거: improve_schedules_structure 시리즈
- 백업 위치: migrations_backup_20250606/

## 실행 완료 파일
✅ Part 1-5 모두 성공적으로 실행 완료

## 백업된 파일
**위치**: `/supabase/migrations_backup_20250608/`
- part1_tourist_attractions_extension.sql
- part2_tour_journey_items_creation.sql
- part3_triggers_and_rls.sql
- part4_boarding_places_cleanup.sql
- part5_sample_data_and_verification.sql
- EXECUTION_GUIDE.md
- 20250608_final_tour_system_migration.sql
- 20250608_create_tour_journey.sql
- 20250608_extend_tourist_attractions.sql
- 20250608_cleanup_boarding_places.sql
- 20250608_complete_tour_system_migration.sql
