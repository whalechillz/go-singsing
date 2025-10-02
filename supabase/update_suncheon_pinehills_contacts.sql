-- 순천 파인힐스 연락처 정보 업데이트
-- 기존 데이터 삭제 후 새로 추가

-- 기존 순천 파인힐스 연락처 삭제
DELETE FROM golf_course_contacts WHERE golf_course_name = '순천 파인힐스';

-- 순천 파인힐스 연락처 정보 추가
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('순천 파인힐스', '예약실', '대표', '061-750-9013', NULL, NULL, '대표 예약실 - 추석, 설날 선물 발송 대상'),
('순천 파인힐스', '회사 핸드폰', '회사', NULL, '010-9520-9015', NULL, '회사 공용 핸드폰 - 추석, 설날 선물 발송 대상'),
('순천 파인힐스', '이경현', '매니저', NULL, '010-7106-6908', NULL, '현장 담당자 - 추석, 설날 선물 발송 대상'),
('순천 파인힐스', '윤팀장', '팀장', NULL, '010-8632-1195', NULL, '팀장 - 추석, 설날 선물 발송 대상');

-- 결과 확인
SELECT * FROM golf_course_contacts WHERE golf_course_name = '순천 파인힐스' ORDER BY position, contact_name;
