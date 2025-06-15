-- 전화번호 형식 검증을 위한 CHECK 제약조건 추가
-- 숫자만 허용하도록 제한

-- users 테이블
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_phone_format_check;

ALTER TABLE public.users
ADD CONSTRAINT users_phone_format_check 
CHECK (phone IS NULL OR phone ~ '^[0-9]+$');

-- customers 테이블
ALTER TABLE public.customers
DROP CONSTRAINT IF EXISTS customers_phone_format_check;

ALTER TABLE public.customers  
ADD CONSTRAINT customers_phone_format_check
CHECK (phone IS NULL OR phone ~ '^[0-9]+$');

-- singsing_participants 테이블
ALTER TABLE public.singsing_participants
DROP CONSTRAINT IF EXISTS participants_phone_format_check;

ALTER TABLE public.singsing_participants
ADD CONSTRAINT participants_phone_format_check  
CHECK (phone IS NULL OR phone ~ '^[0-9]+$');

-- 테스트: 잘못된 형식 입력 시도 (실패해야 함)
-- INSERT INTO users (name, phone, email, role) 
-- VALUES ('테스트', '010-1234-5678', 'test@test.com', 'staff');

-- 테스트: 올바른 형식 입력 (성공해야 함)
-- INSERT INTO users (name, phone, email, role)
-- VALUES ('테스트', '01012345678', 'test@test.com', 'staff');
