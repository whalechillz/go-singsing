-- public.users의 password_hash 컬럼 정리
-- 이 컬럼은 더 이상 사용되지 않음 (auth.users 사용)

-- 1. password_hash 컬럼 삭제 (선택사항)
-- 주의: 되돌릴 수 없으므로 신중하게 결정
-- ALTER TABLE public.users DROP COLUMN password_hash;

-- 2. 또는 NULL로 업데이트 (안전한 방법)
UPDATE public.users
SET password_hash = NULL
WHERE password_hash IS NOT NULL;

-- 3. 컬럼에 코멘트 추가 (권장)
COMMENT ON COLUMN public.users.password_hash IS 
'더 이상 사용되지 않음. auth.users를 사용하세요. Deprecated - use auth.users instead';
