-- 긴급 중복 데이터 정리 및 보호 스크립트
-- 2025-01-06

-- 1. 현재 중복 상태 확인
SELECT 
  participant_id, 
  tee_time_id, 
  COUNT(*) as duplicate_count
FROM singsing_participant_tee_times
GROUP BY participant_id, tee_time_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. 전체 배정 개수 확인
SELECT COUNT(*) as total_assignments FROM singsing_participant_tee_times;

-- 3. 중복 제거 (CTid 방식 - PostgreSQL)
WITH duplicates AS (
  SELECT 
    participant_id,
    tee_time_id,
    MIN(ctid) as keep_ctid
  FROM singsing_participant_tee_times
  GROUP BY participant_id, tee_time_id
  HAVING COUNT(*) > 1
)
DELETE FROM singsing_participant_tee_times
WHERE (participant_id, tee_time_id) IN (
  SELECT participant_id, tee_time_id FROM duplicates
)
AND ctid NOT IN (
  SELECT keep_ctid FROM duplicates
);

-- 4. Unique Constraint 추가 (이미 있으면 무시)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_participant_tee_time'
  ) THEN
    ALTER TABLE singsing_participant_tee_times
    ADD CONSTRAINT unique_participant_tee_time 
    UNIQUE (participant_id, tee_time_id);
  END IF;
END $$;

-- 5. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_participant_tee_times_participant 
ON singsing_participant_tee_times(participant_id);

CREATE INDEX IF NOT EXISTS idx_participant_tee_times_tee_time 
ON singsing_participant_tee_times(tee_time_id);

-- 6. 정리 후 상태 확인
SELECT 
  'Total Assignments' as status, 
  COUNT(*) as count 
FROM singsing_participant_tee_times
UNION ALL
SELECT 
  'Unique Participants' as status, 
  COUNT(DISTINCT participant_id) as count 
FROM singsing_participant_tee_times
UNION ALL
SELECT 
  'Unique Tee Times' as status, 
  COUNT(DISTINCT tee_time_id) as count 
FROM singsing_participant_tee_times;
