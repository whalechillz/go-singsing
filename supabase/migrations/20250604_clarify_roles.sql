-- 계정 관리 시스템 개선
-- 2025-06-04

-- 1. 시스템 역할 정리
UPDATE roles SET 
  name = 'operator',
  description = '운영직원'
WHERE name = 'staff';

UPDATE roles SET 
  description = '투어기사'
WHERE name = 'driver';

-- 새로운 역할 추가
INSERT INTO roles (name, description, permissions) VALUES 
  ('guide', '투어가이드', '{"tours": ["read"], "participants": ["read"]}'),
  ('tour_leader', '인솔자', '{"tours": ["read"], "participants": ["read", "update"]}'),
  ('employee', '일반직원', '{"tours": ["read"], "documents": ["read"]}')
ON CONFLICT (name) DO NOTHING;

-- 2. users 테이블의 role 업데이트
UPDATE users SET role = 'operator' WHERE role = 'staff';

-- 3. 투어 운영진 타입 정의
CREATE TYPE tour_staff_role AS ENUM ('driver', 'guide', 'tour_leader', 'support');

-- 4. singsing_tour_staff 테이블 개선
ALTER TABLE singsing_tour_staff 
  ALTER COLUMN role TYPE VARCHAR(50),
  ADD COLUMN role_type tour_staff_role;

-- 기존 데이터 마이그레이션
UPDATE singsing_tour_staff 
SET role_type = CASE 
  WHEN role = '기사' THEN 'driver'::tour_staff_role
  WHEN role = '가이드' THEN 'guide'::tour_staff_role
  WHEN role = '인솔자' THEN 'tour_leader'::tour_staff_role
  ELSE 'support'::tour_staff_role
END;

-- 5. 뷰 개선: 투어 운영진 상세 정보
CREATE OR REPLACE VIEW tour_staff_details AS
SELECT 
  s.id,
  s.tour_id,
  s.name,
  s.phone,
  s.role,
  s.role_type,
  s.order,
  s.user_id,
  t.title as tour_title,
  t.start_date,
  t.end_date,
  u.email as user_email,
  u.role as system_role,
  r.description as system_role_desc
FROM singsing_tour_staff s
LEFT JOIN singsing_tours t ON s.tour_id = t.id
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY t.start_date, s.role_type, s.order;