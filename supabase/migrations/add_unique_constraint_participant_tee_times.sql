-- 중복 데이터 제거 (중복된 경우 가장 최근 것만 남김)
WITH duplicates AS (
  SELECT 
    participant_id,
    tee_time_id,
    MAX(created_at) as latest_created_at
  FROM singsing_participant_tee_times
  GROUP BY participant_id, tee_time_id
  HAVING COUNT(*) > 1
)
DELETE FROM singsing_participant_tee_times
WHERE (participant_id, tee_time_id, created_at) IN (
  SELECT 
    pt.participant_id,
    pt.tee_time_id,
    pt.created_at
  FROM singsing_participant_tee_times pt
  INNER JOIN duplicates d 
    ON pt.participant_id = d.participant_id 
    AND pt.tee_time_id = d.tee_time_id
  WHERE pt.created_at < d.latest_created_at
);

-- Unique constraint 추가 (participant_id와 tee_time_id 조합이 유일해야 함)
ALTER TABLE singsing_participant_tee_times
ADD CONSTRAINT unique_participant_tee_time 
UNIQUE (participant_id, tee_time_id);

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_participant_tee_times_participant_id 
ON singsing_participant_tee_times(participant_id);

CREATE INDEX IF NOT EXISTS idx_participant_tee_times_tee_time_id 
ON singsing_participant_tee_times(tee_time_id);
