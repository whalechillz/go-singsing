-- 1. 다대다 테이블의 중복 제거 쿼리
-- 중복된 참가자-티타임 매핑 확인
SELECT 
  participant_id,
  tee_time_id,
  COUNT(*) as duplicate_count
FROM singsing_participant_tee_times
GROUP BY participant_id, tee_time_id
HAVING COUNT(*) > 1;

-- 2. 참가자 테이블에서 날짜가 포함된 이름 찾기
-- 예: "조민자 (4/14)" 형태의 중복 참가자 찾기
SELECT 
  name,
  COUNT(*) as count,
  STRING_AGG(id, ', ') as participant_ids
FROM singsing_participants
WHERE tour_id = '[YOUR_TOUR_ID]'  -- 투어 ID 입력
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- 3. 이름에서 날짜 부분 제거하여 원본 이름으로 그룹화
WITH cleaned_names AS (
  SELECT 
    id,
    name,
    REGEXP_REPLACE(name, '\s*\([^)]*\)$', '') as clean_name,
    phone,
    tour_id,
    created_at
  FROM singsing_participants
  WHERE tour_id = '[YOUR_TOUR_ID]'  -- 투어 ID 입력
)
SELECT 
  clean_name,
  COUNT(*) as duplicate_count,
  STRING_AGG(id || ' (' || name || ')', ', ' ORDER BY created_at) as all_records
FROM cleaned_names
GROUP BY clean_name, phone
HAVING COUNT(*) > 1
ORDER BY clean_name;

-- 4. 중복 참가자의 티타임 배정 정보 확인
WITH duplicates AS (
  SELECT 
    p.id,
    p.name,
    REGEXP_REPLACE(p.name, '\s*\([^)]*\)$', '') as clean_name,
    p.phone,
    p.tour_id,
    p.created_at
  FROM singsing_participants p
  WHERE p.tour_id = '[YOUR_TOUR_ID]'  -- 투어 ID 입력
)
SELECT 
  d.clean_name,
  d.name as full_name,
  d.id as participant_id,
  tt.play_date,
  tt.tee_time,
  tt.golf_course
FROM duplicates d
LEFT JOIN singsing_participant_tee_times pt ON d.id = pt.participant_id
LEFT JOIN singsing_tee_times tt ON pt.tee_time_id = tt.id
WHERE d.clean_name IN (
  SELECT clean_name 
  FROM duplicates 
  GROUP BY clean_name, phone 
  HAVING COUNT(*) > 1
)
ORDER BY d.clean_name, tt.play_date;

-- 5. 중복 데이터 병합 스크립트 (실행 전 반드시 백업!)
-- 먼저 실행할 내용 미리보기
WITH duplicate_groups AS (
  SELECT 
    MIN(id) as primary_id,
    REGEXP_REPLACE(name, '\s*\([^)]*\)$', '') as clean_name,
    phone,
    tour_id,
    ARRAY_AGG(id ORDER BY created_at) as all_ids
  FROM singsing_participants
  WHERE tour_id = '[YOUR_TOUR_ID]'  -- 투어 ID 입력
  GROUP BY REGEXP_REPLACE(name, '\s*\([^)]*\)$', ''), phone, tour_id
  HAVING COUNT(*) > 1
)
SELECT 
  clean_name,
  primary_id as '유지할_ID',
  array_to_string(array_remove(all_ids, primary_id), ', ') as '삭제할_IDs'
FROM duplicate_groups;

-- 6. 실제 병합 수행 (위 5번 확인 후 실행)
-- 트랜잭션으로 안전하게 처리
BEGIN;

-- 6-1. 티타임 배정 정보를 primary 참가자로 이전
WITH duplicate_groups AS (
  SELECT 
    MIN(id) as primary_id,
    REGEXP_REPLACE(name, '\s*\([^)]*\)$', '') as clean_name,
    phone,
    tour_id,
    ARRAY_AGG(id ORDER BY created_at) as all_ids
  FROM singsing_participants
  WHERE tour_id = '[YOUR_TOUR_ID]'  -- 투어 ID 입력
  GROUP BY REGEXP_REPLACE(name, '\s*\([^)]*\)$', ''), phone, tour_id
  HAVING COUNT(*) > 1
),
assignments_to_move AS (
  SELECT DISTINCT
    dg.primary_id as new_participant_id,
    pt.tee_time_id
  FROM duplicate_groups dg
  CROSS JOIN LATERAL unnest(dg.all_ids) as dup_id
  JOIN singsing_participant_tee_times pt ON pt.participant_id = dup_id
  WHERE dup_id != dg.primary_id
)
INSERT INTO singsing_participant_tee_times (participant_id, tee_time_id)
SELECT new_participant_id, tee_time_id
FROM assignments_to_move
ON CONFLICT (participant_id, tee_time_id) DO NOTHING;

-- 6-2. 중복 참가자의 티타임 배정 삭제
WITH duplicate_groups AS (
  SELECT 
    MIN(id) as primary_id,
    ARRAY_AGG(id ORDER BY created_at) as all_ids
  FROM singsing_participants
  WHERE tour_id = '[YOUR_TOUR_ID]'  -- 투어 ID 입력
  GROUP BY REGEXP_REPLACE(name, '\s*\([^)]*\)$', ''), phone, tour_id
  HAVING COUNT(*) > 1
)
DELETE FROM singsing_participant_tee_times
WHERE participant_id IN (
  SELECT unnest(array_remove(all_ids, primary_id))
  FROM duplicate_groups
);

-- 6-3. primary 참가자의 이름을 깔끔하게 정리
UPDATE singsing_participants
SET name = REGEXP_REPLACE(name, '\s*\([^)]*\)$', '')
WHERE id IN (
  SELECT MIN(id)
  FROM singsing_participants
  WHERE tour_id = '[YOUR_TOUR_ID]'  -- 투어 ID 입력
  GROUP BY REGEXP_REPLACE(name, '\s*\([^)]*\)$', ''), phone, tour_id
  HAVING COUNT(*) > 1
);

-- 6-4. 중복 참가자 삭제
WITH duplicate_groups AS (
  SELECT 
    MIN(id) as primary_id,
    ARRAY_AGG(id ORDER BY created_at) as all_ids
  FROM singsing_participants
  WHERE tour_id = '[YOUR_TOUR_ID]'  -- 투어 ID 입력
  GROUP BY REGEXP_REPLACE(name, '\s*\([^)]*\)$', ''), phone, tour_id
  HAVING COUNT(*) > 1
)
DELETE FROM singsing_participants
WHERE id IN (
  SELECT unnest(array_remove(all_ids, primary_id))
  FROM duplicate_groups
);

COMMIT;
-- 문제 발생 시 ROLLBACK; 실행
