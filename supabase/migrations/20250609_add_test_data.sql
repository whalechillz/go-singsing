-- ================================================================
-- 테스트를 위한 기본 데이터 추가
-- ================================================================

-- 1. 탑승지 테스트 데이터
INSERT INTO singsing_boarding_places (name, address, boarding_main)
VALUES 
  ('서울역', '서울특별시 용산구 한강대로 405', '서울역 3번 출구 앞'),
  ('부산역', '부산광역시 동구 중앙대로 206', '부산역 광장'),
  ('인천공항', '인천광역시 중구 공항로 272', '제1터미널 3층 출국장')
ON CONFLICT DO NOTHING;

-- 2. 관광지 테스트 데이터
INSERT INTO tourist_attractions (name, category, address, is_active)
VALUES 
  ('죽도휴게소', 'rest_area', '경상북도 울진군 울진읍', true),
  ('한정식당', 'restaurant', '서울시 강남구 테헤란로', true),
  ('경주월드', 'tourist_spot', '경상북도 경주시', true),
  ('이마트 부산점', 'shopping', '부산광역시 해운대구', true)
ON CONFLICT DO NOTHING;

-- 3. 데이터 확인
SELECT 'boarding_places' as table_name, COUNT(*) as count FROM singsing_boarding_places
UNION ALL
SELECT 'tourist_attractions', COUNT(*) FROM tourist_attractions;

-- 4. 메시지
DO $$
BEGIN
    RAISE NOTICE '테스트 데이터가 추가되었습니다.';
END $$;
