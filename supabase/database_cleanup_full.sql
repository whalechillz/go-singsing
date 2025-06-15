-- 데이터베이스 정리 및 표준화
-- 2025-06-15

-- ========================================
-- 1. 전화번호 형식 통일 (하이픈 제거)
-- ========================================
BEGIN;

-- users 테이블
UPDATE public.users
SET phone = REPLACE(REPLACE(phone, '-', ''), ' ', '')
WHERE phone IS NOT NULL 
  AND (phone LIKE '%-%' OR phone LIKE '% %');

-- customers 테이블  
UPDATE public.customers
SET phone = REPLACE(REPLACE(phone, '-', ''), ' ', '')
WHERE phone IS NOT NULL
  AND (phone LIKE '%-%' OR phone LIKE '% %');

-- 통일 결과 확인
SELECT 
    'users' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN phone LIKE '%-%' THEN 1 END) as with_hyphen,
    COUNT(CASE WHEN phone NOT LIKE '%-%' AND phone IS NOT NULL THEN 1 END) as without_hyphen
FROM public.users
UNION ALL
SELECT 
    'customers',
    COUNT(*),
    COUNT(CASE WHEN phone LIKE '%-%' THEN 1 END),
    COUNT(CASE WHEN phone NOT LIKE '%-%' AND phone IS NOT NULL THEN 1 END)
FROM public.customers;

COMMIT;

-- ========================================
-- 2. 사용하지 않는 컬럼 정리
-- ========================================

-- password_hash 컬럼 (auth.users 사용으로 불필요)
COMMENT ON COLUMN public.users.password_hash IS 
'DEPRECATED: auth.users를 사용하세요. Do not use this column.';

-- role_id 컬럼 (모두 NULL)
COMMENT ON COLUMN public.users.role_id IS 
'DEPRECATED: role 컬럼을 사용하세요. Use role column instead.';

-- ========================================
-- 3. auth.users와 public.users 동기화 확인
-- ========================================
SELECT 
    pu.name,
    pu.email,
    pu.phone,
    CASE 
        WHEN au.email IS NOT NULL THEN '✓ 로그인 가능'
        ELSE '✗ 로그인 불가'
    END as auth_status,
    CASE
        WHEN pu.phone LIKE '%-%' THEN '하이픈 있음'
        WHEN pu.phone IS NULL THEN 'NULL'
        ELSE '정상 (숫자만)'
    END as phone_status
FROM public.users pu
LEFT JOIN auth.users au ON pu.email = au.email
ORDER BY auth_status DESC, pu.created_at DESC;
