-- 추가 골프장 연락처 및 싱싱골프 스탭 추가

-- 영광 웨스트 오션 골프장 연락처 추가
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('영광 웨스트 오션', '대표', '대표', '061-000-0000', NULL, NULL, '영광 웨스트 오션 골프장 대표'),
('영광 웨스트 오션', '박미진', '팀장', NULL, '010-0000-0000', NULL, '팀장 - 선물 발송 대상')
ON CONFLICT DO NOTHING;

-- 세븐힐스 골프장 연락처 추가
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('세븐힐스', '대표', '대표', '061-000-0001', NULL, NULL, '세븐힐스 골프장 대표')
ON CONFLICT DO NOTHING;

-- 싱싱골프 스탭 연락처 추가
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('싱싱골프', '유중현', '스탭', NULL, '010-0000-0002', NULL, '싱싱골프 스탭'),
('싱싱골프', '박주희', '스탭', NULL, '010-0000-0003', NULL, '싱싱골프 스탭'),
('싱싱골프', '신정란', '스탭', NULL, '010-0000-0004', NULL, '싱싱골프 스탭'),
('싱싱골프', '김성팔', '스탭', NULL, '010-0000-0005', NULL, '싱싱골프 스탭')
ON CONFLICT DO NOTHING;
