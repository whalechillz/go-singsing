-- ================================================================
-- 투어 관리 시스템 재구조화 마이그레이션 완료
-- 완료일: 2025-06-08
-- ================================================================

-- 이 파일은 마이그레이션이 완료되었음을 나타냅니다.
-- 실행된 마이그레이션 파일들은 migrations_backup_20250608 폴더에 백업되었습니다.

-- 완료된 변경사항:
-- 1. tourist_attractions 테이블 확장
--    - 새 카테고리 추가: mart, golf_round, club_meal, others
--    - 새 컬럼 추가: sub_category, golf_course_info, meal_info, parking_info, entrance_fee, booking_required

-- 2. tour_journey_items 테이블 생성
--    - 투어별 여정 관리 기능
--    - 타임라인/카테고리 뷰 지원

-- 3. singsing_boarding_places 테이블 정리
--    - 탑승지만 관리하도록 변경
--    - 나머지 데이터는 tourist_attractions로 이관

-- 4. RLS 정책 및 트리거 설정 완료

-- 시스템 상태 확인 쿼리
SELECT 'MIGRATION COMPLETED' as status, NOW() as completed_at;
