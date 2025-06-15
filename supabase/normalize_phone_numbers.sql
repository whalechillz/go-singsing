-- 모든 테이블의 전화번호에서 하이픈 제거
-- 2025-06-15

-- 1. users 테이블
UPDATE public.users
SET phone = REPLACE(REPLACE(phone, '-', ''), ' ', '')
WHERE phone IS NOT NULL 
  AND (phone LIKE '%-%' OR phone LIKE '% %');

-- 2. customers 테이블  
UPDATE public.customers
SET phone = REPLACE(REPLACE(phone, '-', ''), ' ', '')
WHERE phone IS NOT NULL
  AND (phone LIKE '%-%' OR phone LIKE '% %');

-- 3. singsing_participants 테이블
UPDATE public.singsing_participants  
SET phone = REPLACE(REPLACE(phone, '-', ''), ' ', '')
WHERE phone IS NOT NULL
  AND (phone LIKE '%-%' OR phone LIKE '% %');

UPDATE public.singsing_participants
SET emergency_contact = REPLACE(REPLACE(emergency_contact, '-', ''), ' ', '')
WHERE emergency_contact IS NOT NULL
  AND (emergency_contact LIKE '%-%' OR emergency_contact LIKE '% %');

-- 4. singsing_tour_staff 테이블
UPDATE public.singsing_tour_staff
SET phone = REPLACE(REPLACE(phone, '-', ''), ' ', '')
WHERE phone IS NOT NULL
  AND (phone LIKE '%-%' OR phone LIKE '% %');

-- 5. boarding_guide_contacts 테이블
UPDATE public.boarding_guide_contacts
SET phone = REPLACE(REPLACE(phone, '-', ''), ' ', '')
WHERE phone IS NOT NULL
  AND (phone LIKE '%-%' OR phone LIKE '% %');

-- 6. singsing_tours 테이블 (회사 전화번호들)
UPDATE public.singsing_tours
SET 
    company_phone = REPLACE(REPLACE(company_phone, '-', ''), ' ', ''),
    company_mobile = REPLACE(REPLACE(company_mobile, '-', ''), ' ', ''),
    golf_reservation_phone = REPLACE(REPLACE(golf_reservation_phone, '-', ''), ' ', ''),
    golf_reservation_mobile = REPLACE(REPLACE(golf_reservation_mobile, '-', ''), ' ', '')
WHERE company_phone LIKE '%-%' 
   OR company_mobile LIKE '%-%'
   OR golf_reservation_phone LIKE '%-%'
   OR golf_reservation_mobile LIKE '%-%';

-- 결과 확인
SELECT 'users' as table_name, COUNT(*) as count
FROM public.users 
WHERE phone LIKE '%-%'
UNION ALL
SELECT 'customers', COUNT(*)
FROM public.customers
WHERE phone LIKE '%-%'
UNION ALL  
SELECT 'participants', COUNT(*)
FROM public.singsing_participants
WHERE phone LIKE '%-%' OR emergency_contact LIKE '%-%';
