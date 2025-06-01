-- 1. 기존 중복 데이터 확인 및 정리
-- 중복 확인
SELECT 
  participant_id, 
  tee_time_id, 
  COUNT(*) as count
FROM singsing_participant_tee_times
GROUP BY participant_id, tee_time_id
HAVING COUNT(*) > 1;

-- 2. 중복 제거 (가장 오래된 것만 남김)
DELETE FROM singsing_participant_tee_times a
USING singsing_participant_tee_times b
WHERE a.ctid < b.ctid 
  AND a.participant_id = b.participant_id 
  AND a.tee_time_id = b.tee_time_id;

-- 3. Unique constraint 추가 (이미 있으면 에러 나도 괜찮음)
ALTER TABLE singsing_participant_tee_times
ADD CONSTRAINT unique_participant_tee_time 
UNIQUE (participant_id, tee_time_id);

-- 4. id 컬럼이 없는 경우 추가
ALTER TABLE singsing_participant_tee_times 
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() PRIMARY KEY;
