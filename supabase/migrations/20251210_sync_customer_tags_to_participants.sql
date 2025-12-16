-- supabase/migrations/20251210_sync_customer_tags_to_participants.sql
-- 고객의 tags를 참가자의 team_name으로 동기화
-- 전화번호 정규화 (하이픈 제거)하여 매칭

-- 1. 전화번호 정규화 함수 (하이픈 제거)
-- 참고: PostgreSQL에서는 정규화된 전화번호로 비교

-- 2. 고객의 tags를 참가자의 team_name으로 업데이트
-- team_name이 null이거나 빈 값인 참가자만 업데이트
UPDATE singsing_participants p
SET team_name = c.tags[1]  -- 첫 번째 모임명 사용
FROM customers c
WHERE 
  -- 전화번호 정규화하여 비교 (하이픈 제거)
  REGEXP_REPLACE(c.phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(p.phone, '[^0-9]', '', 'g')
  AND c.tags IS NOT NULL
  AND array_length(c.tags, 1) > 0
  AND (p.team_name IS NULL OR p.team_name = '');

