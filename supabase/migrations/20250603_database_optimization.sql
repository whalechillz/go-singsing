-- 2025-06-03: 데이터베이스 구조 최적화
-- 미사용 테이블 삭제, 미사용 컬럼 제거, 인덱스 추가

-- ========================================
-- 1. 백업 테이블 삭제
-- ========================================
DROP TABLE IF EXISTS singsing_tours_backup CASCADE;
DROP TABLE IF EXISTS singsing_tee_times_backup CASCADE;
DROP TABLE IF EXISTS singsing_tee_time_players_old CASCADE;

-- ========================================
-- 2. document 관련 미사용 테이블 삭제
-- ========================================
DROP TABLE IF EXISTS document_footers CASCADE;
DROP TABLE IF EXISTS document_notices CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;

-- ========================================
-- 3. boarding_guide 관련 테이블 삭제 (이미 통합 완료)
-- ========================================
DROP TABLE IF EXISTS boarding_guide_contacts CASCADE;
DROP TABLE IF EXISTS boarding_guide_notices CASCADE;
DROP TABLE IF EXISTS boarding_guide_routes CASCADE;

-- ========================================
-- 4. 기타 미사용 테이블 삭제
-- ========================================
DROP TABLE IF EXISTS tour_basic_info CASCADE;
DROP TABLE IF EXISTS singsing_pickup_points CASCADE;
DROP TABLE IF EXISTS singsing_work_memo_comments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- 5. tour_products 테이블 미사용 컬럼 삭제
-- ========================================
ALTER TABLE tour_products 
DROP COLUMN IF EXISTS schedule CASCADE;

ALTER TABLE tour_products 
DROP COLUMN IF EXISTS reservation_notice CASCADE;

ALTER TABLE tour_products 
DROP COLUMN IF EXISTS note CASCADE;

ALTER TABLE tour_products 
DROP COLUMN IF EXISTS usage_guide CASCADE;

-- ========================================
-- 6. 성능 최적화를 위한 인덱스 추가
-- ========================================

-- 투어 시작 날짜 인덱스 (목록 조회 시 정렬)
CREATE INDEX IF NOT EXISTS idx_singsing_tours_start_date 
ON singsing_tours(start_date);

-- 참가자 투어 ID 인덱스 (투어별 참가자 조회)
CREATE INDEX IF NOT EXISTS idx_singsing_participants_tour_id 
ON singsing_participants(tour_id);

-- 참가자 상태 인덱스 (확정된 참가자 필터링)
CREATE INDEX IF NOT EXISTS idx_singsing_participants_status 
ON singsing_participants(status);

-- 일정 투어 ID 인덱스 (투어별 일정 조회)
CREATE INDEX IF NOT EXISTS idx_singsing_schedules_tour_id 
ON singsing_schedules(tour_id);

-- 일정 날짜 인덱스 (날짜별 일정 조회)
CREATE INDEX IF NOT EXISTS idx_singsing_schedules_date 
ON singsing_schedules(date);

-- 결제 투어 ID 인덱스 (투어별 결제 조회)
CREATE INDEX IF NOT EXISTS idx_singsing_payments_tour_id 
ON singsing_payments(tour_id);

-- 티타임 투어 ID 인덱스 (투어별 티타임 조회)
CREATE INDEX IF NOT EXISTS idx_singsing_tee_times_tour_id 
ON singsing_tee_times(tour_id);

-- 티타임 플레이 날짜 인덱스 (날짜별 티타임 조회)
CREATE INDEX IF NOT EXISTS idx_singsing_tee_times_play_date 
ON singsing_tee_times(play_date);

-- ========================================
-- 7. 통계 정보 업데이트
-- ========================================
ANALYZE;

-- ========================================
-- 8. 완료 메시지
-- ========================================
-- 삭제된 테이블: 13개
-- 삭제된 컬럼: 4개 (tour_products)
-- 추가된 인덱스: 8개
-- 최종 테이블 수: 15개 + 1개 뷰
