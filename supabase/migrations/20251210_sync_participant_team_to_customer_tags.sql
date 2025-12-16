-- supabase/migrations/20251210_sync_participant_team_to_customer_tags.sql
-- 참가자의 team_name을 customers.tags로 통합

-- 1. 참가자의 team_name을 customers.tags에 추가 (중복 제거)
UPDATE customers c
SET tags = CASE 
  WHEN c.tags IS NULL THEN ARRAY[p.team_name::text]
  WHEN NOT (c.tags @> ARRAY[p.team_name::text]) THEN array_append(c.tags, p.team_name::text)
  ELSE c.tags
END
FROM singsing_participants p
WHERE c.phone = p.phone
  AND p.team_name IS NOT NULL
  AND p.team_name != ''
  AND p.team_name::text != '';

