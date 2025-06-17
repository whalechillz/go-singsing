-- 마케팅 표시용 참가자 수 필드 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS marketing_participant_count INTEGER;

-- 기존 데이터의 경우 실제 참가자 수로 초기화
UPDATE singsing_tours 
SET marketing_participant_count = current_participants 
WHERE marketing_participant_count IS NULL;

-- 코멘트 추가
COMMENT ON COLUMN singsing_tours.marketing_participant_count IS '마케팅 페이지에 표시할 참가자 수 (실제 참가자 수와 다르게 설정 가능)';
