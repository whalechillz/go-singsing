-- 누락된 마이그레이션 실행
-- 영광 웨스트 오션, 세븐힐스, 싱싱골프 스탭 연락처 추가

-- 영광 웨스트 오션 골프장 연락처 추가
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('영광 웨스트 오션', '대표', '대표', '061-350-2000', NULL, NULL, '영광 웨스트 오션 골프장 대표'),
('영광 웨스트 오션', '박미진', '팀장', NULL, '010-6302-2111', NULL, '팀장 - 선물 발송 대상'),
('영광 웨스트 오션', '고희정', '팀장', NULL, '010-7793-6400', NULL, '팀장 - 선물 발송 대상')
ON CONFLICT DO NOTHING;

-- 세븐힐스 골프장 연락처 추가
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('세븐힐스', '대표', '대표', '061-000-0001', NULL, NULL, '세븐힐스 골프장 대표')
ON CONFLICT DO NOTHING;

-- 싱싱골프 스탭 연락처 추가
INSERT INTO golf_course_contacts (golf_course_name, contact_name, position, phone, mobile, email, notes) VALUES
('싱싱골프', '유중현', '스탭', NULL, '010-7114-8803', NULL, '싱싱골프 스탭'),
('싱싱골프', '박주희', '스탭', NULL, '010-4324-2437', NULL, '싱싱골프 스탭'),
('싱싱골프', '신정란', '스탭', NULL, '010-0000-0004', NULL, '싱싱골프 스탭'),
('싱싱골프', '김성팔', '스탭', NULL, '010-5254-9876', NULL, '싱싱골프 스탭')
ON CONFLICT DO NOTHING;

-- 선물 발송 이력 추가

-- 2023년 1월 27일: 마카롱 12구 (36,000원) → 영광 웨스트 오션 박미진 팀장
INSERT INTO gift_sending_history (
  golf_course_contact_id,
  occasion,
  gift_type,
  gift_amount,
  quantity,
  sent_date,
  sent_by,
  notes
) 
SELECT 
  gc.id,
  '일반',
  '마카롱 12구',
  36000,
  1,
  '2023-01-27'::DATE,
  '관리자',
  '영광 웨스트 오션 박미진 팀장'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '영광 웨스트 오션' AND gc.contact_name = '박미진'
ON CONFLICT DO NOTHING;

-- 2023년 8월 17일: 스타벅스 상품권 (50,000원) → 세븐힐스 대표
INSERT INTO gift_sending_history (
  golf_course_contact_id,
  occasion,
  gift_type,
  gift_amount,
  quantity,
  sent_date,
  sent_by,
  notes
) 
SELECT 
  gc.id,
  '일반',
  '스타벅스 상품권',
  50000,
  1,
  '2023-08-17'::DATE,
  '관리자',
  '세븐힐스 대표'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '세븐힐스' AND gc.contact_name = '대표'
ON CONFLICT DO NOTHING;

-- 2024년 2월 6일: 스타벅스 상품권 (60,000원) → 싱싱골프 스탭 유중현(30,000), 박주희(30,000)
INSERT INTO gift_sending_history (
  golf_course_contact_id,
  occasion,
  gift_type,
  gift_amount,
  quantity,
  sent_date,
  sent_by,
  notes
) 
SELECT 
  gc.id,
  '일반',
  '스타벅스 상품권',
  30000,
  1,
  '2024-02-06'::DATE,
  '관리자',
  '싱싱골프 스탭 유중현'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '싱싱골프' AND gc.contact_name = '유중현'
ON CONFLICT DO NOTHING;

INSERT INTO gift_sending_history (
  golf_course_contact_id,
  occasion,
  gift_type,
  gift_amount,
  quantity,
  sent_date,
  sent_by,
  notes
) 
SELECT 
  gc.id,
  '일반',
  '스타벅스 상품권',
  30000,
  1,
  '2024-02-06'::DATE,
  '관리자',
  '싱싱골프 스탭 박주희'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '싱싱골프' AND gc.contact_name = '박주희'
ON CONFLICT DO NOTHING;

-- 2024년 9월 10일: 스타벅스 상품권 (60,000원) → 싱싱골프 스탭 김성팔(30,000), 신정란(30,000)
INSERT INTO gift_sending_history (
  golf_course_contact_id,
  occasion,
  gift_type,
  gift_amount,
  quantity,
  sent_date,
  sent_by,
  notes
) 
SELECT 
  gc.id,
  '일반',
  '스타벅스 상품권',
  30000,
  1,
  '2024-09-10'::DATE,
  '관리자',
  '싱싱골프 스탭 김성팔'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '싱싱골프' AND gc.contact_name = '김성팔'
ON CONFLICT DO NOTHING;

INSERT INTO gift_sending_history (
  golf_course_contact_id,
  occasion,
  gift_type,
  gift_amount,
  quantity,
  sent_date,
  sent_by,
  notes
) 
SELECT 
  gc.id,
  '일반',
  '스타벅스 상품권',
  30000,
  1,
  '2024-09-10'::DATE,
  '관리자',
  '싱싱골프 스탭 신정란'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '싱싱골프' AND gc.contact_name = '신정란'
ON CONFLICT DO NOTHING;
