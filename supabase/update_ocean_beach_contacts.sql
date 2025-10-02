-- 영덕 오션비치 연락처 정보 업데이트
-- 기존 데이터 삭제 후 새로 추가

-- 기존 영덕 오션비치 연락처 삭제
DELETE FROM golf_course_contacts WHERE golf_course_name = '영덕 오션비치';

-- 영덕 오션비치 연락처 정보 추가
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('영덕 오션비치', '예약실', '대표', '054-730-9001', NULL, NULL, '대표 예약실 - 추석, 설날 선물 발송 대상'),
('영덕 오션비치', '이초희', '회사', NULL, '010-7324-9003', NULL, '회사 핸드폰 - 추석, 설날 선물 발송 대상'),
('영덕 오션비치', '김상관', '부장', NULL, '010-8584-0839', NULL, '부장 - 추석, 설날 선물 발송 대상');

-- 결과 확인
SELECT * FROM golf_course_contacts WHERE golf_course_name = '영덕 오션비치' ORDER BY position, contact_name;
