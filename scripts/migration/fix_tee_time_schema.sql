-- 티오프시간 시스템 스키마 정리 및 수정
-- 2025-05-31

-- 1. 기존 테이블 확인 및 정리
-- tee_times와 singsing_tee_times 중 어떤 것을 사용하는지 확인

-- 2. singsing_tee_times 테이블 구조 확인 및 수정
-- date 컬럼 관련 에러 해결
DO $$ 
BEGIN
  -- play_date 컬럼이 있고 date 컬럼이 없는 경우 (정상)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_tee_times' 
    AND column_name = 'play_date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_tee_times' 
    AND column_name = 'date'
  ) THEN
    -- 정상적인 상태
    RAISE NOTICE 'singsing_tee_times table has correct structure with play_date column';
  
  -- date 컬럼만 있는 경우
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_tee_times' 
    AND column_name = 'date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_tee_times' 
    AND column_name = 'play_date'
  ) THEN
    -- date를 play_date로 이름 변경
    ALTER TABLE singsing_tee_times RENAME COLUMN date TO play_date;
    RAISE NOTICE 'Renamed date column to play_date';
  
  -- 둘 다 있는 경우
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_tee_times' 
    AND column_name = 'date'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_tee_times' 
    AND column_name = 'play_date'
  ) THEN
    -- date 컬럼의 데이터를 play_date로 이동하고 date 컬럼 삭제
    UPDATE singsing_tee_times 
    SET play_date = date 
    WHERE play_date IS NULL AND date IS NOT NULL;
    
    ALTER TABLE singsing_tee_times DROP COLUMN date;
    RAISE NOTICE 'Migrated data from date to play_date and dropped date column';
  END IF;
END $$;

-- 3. singsing_participants 테이블에 tee_time_id 컬럼 확인 및 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_participants' 
    AND column_name = 'tee_time_id'
  ) THEN
    ALTER TABLE singsing_participants 
    ADD COLUMN tee_time_id UUID REFERENCES singsing_tee_times(id) ON DELETE SET NULL;
    
    CREATE INDEX idx_participants_tee_time_id ON singsing_participants(tee_time_id);
    RAISE NOTICE 'Added tee_time_id column to singsing_participants table';
  END IF;
END $$;

-- 4. golf_course 대신 course 컬럼이 있는 경우 처리
DO $$ 
BEGIN
  -- course 컬럼이 있고 golf_course 컬럼이 없는 경우
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_tee_times' 
    AND column_name = 'course'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'singsing_tee_times' 
    AND column_name = 'golf_course'
  ) THEN
    ALTER TABLE singsing_tee_times RENAME COLUMN course TO golf_course;
    RAISE NOTICE 'Renamed course column to golf_course';
  END IF;
END $$;

-- 5. 골프 코스 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS golf_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 기본 골프 코스 데이터 삽입
INSERT INTO golf_courses (name, display_order) VALUES
  ('파인', 1),
  ('레이크', 2),
  ('힐스', 3),
  ('마운틴', 4),
  ('밸리', 5),
  ('황경숙', 6),
  ('이용미', 7),
  ('윤경숙', 8),
  ('손귀순', 9),
  ('김기남', 10),
  ('김영기', 11),
  ('주강택', 12),
  ('김영은', 13),
  ('김학란', 14),
  ('김덕수', 15),
  ('전현선', 16),
  ('조미영', 17),
  ('김애자', 18),
  ('양부석', 19),
  ('정재원', 20),
  ('백연희', 21),
  ('백연옥', 22),
  ('오규희', 23),
  ('조나경', 24),
  ('김미정', 25)
ON CONFLICT (name) DO NOTHING;

-- 7. RLS 정책 설정
ALTER TABLE golf_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for all users" ON golf_courses
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations for all users" ON golf_courses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 8. 스키마 캐시 새로고침을 위한 설명 추가
COMMENT ON TABLE singsing_tee_times IS '투어별 티오프시간 관리 (play_date, golf_course, tee_time 사용)';
COMMENT ON TABLE singsing_participants IS '투어 참가자 정보 (tee_time_id로 티타임 연결)';
COMMENT ON TABLE golf_courses IS '골프 코스 목록 관리';

-- 9. 뷰 생성 - 티타임별 참가자 수
CREATE OR REPLACE VIEW tee_time_participant_counts AS
SELECT 
  tt.id,
  tt.tour_id,
  tt.play_date,
  tt.golf_course,
  tt.tee_time,
  tt.max_players,
  COUNT(sp.id) as current_players,
  tt.max_players - COUNT(sp.id) as available_slots
FROM singsing_tee_times tt
LEFT JOIN singsing_participants sp ON sp.tee_time_id = tt.id
GROUP BY tt.id, tt.tour_id, tt.play_date, tt.golf_course, tt.tee_time, tt.max_players;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '티오프시간 시스템 스키마 정리 완료';
  RAISE NOTICE '- singsing_tee_times: play_date, golf_course 컬럼 사용';
  RAISE NOTICE '- singsing_participants: tee_time_id 컬럼으로 연결';
  RAISE NOTICE '- golf_courses: 코스 목록 관리 테이블 생성';
END $$;