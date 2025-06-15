-- 투어 상태 관리를 위한 필드 추가
ALTER TABLE singsing_tours
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS closed_reason TEXT,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

-- 현재 참가자 수를 계산하는 함수
CREATE OR REPLACE FUNCTION update_tour_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 참가자가 추가되거나 삭제될 때마다 현재 참가자 수 업데이트
  UPDATE singsing_tours
  SET current_participants = (
    SELECT COUNT(*)
    FROM tour_participants
    WHERE tour_id = COALESCE(NEW.tour_id, OLD.tour_id)
      AND status = 'confirmed'
  )
  WHERE id = COALESCE(NEW.tour_id, OLD.tour_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_tour_participants_count_trigger ON tour_participants;
CREATE TRIGGER update_tour_participants_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON tour_participants
FOR EACH ROW
EXECUTE FUNCTION update_tour_participants_count();

-- 기존 데이터에 대한 현재 참가자 수 업데이트
UPDATE singsing_tours t
SET current_participants = (
  SELECT COUNT(*)
  FROM tour_participants p
  WHERE p.tour_id = t.id
    AND p.status = 'confirmed'
);

-- 6월 16일 투어를 마감으로 설정 (예시)
UPDATE singsing_tours
SET is_closed = TRUE,
    closed_reason = '조기 마감',
    closed_at = NOW()
WHERE start_date = '2025-06-16';
