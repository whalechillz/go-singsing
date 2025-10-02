-- 선물 발송 이력 추가 (골프장별로 한번에 입력)

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
WHERE gc.golf_course_name = '영광 웨스트 오션' AND gc.contact_name = '박미진';

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
WHERE gc.golf_course_name = '세븐힐스' AND gc.contact_name = '대표';

-- 2023년 9월 25일: 스타벅스 상품권 (180,000원) → 영덕오션비치 2만원*5명, 순천파인힐스 2만원*4명 (추석)
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
  '추석',
  '스타벅스 상품권',
  100000,
  5,
  '2023-09-25'::DATE,
  '관리자',
  '영덕오션비치 2만원*5명'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '영덕 오션비치' AND gc.contact_name = '예약실';

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
  '추석',
  '스타벅스 상품권',
  80000,
  4,
  '2023-09-25'::DATE,
  '관리자',
  '순천파인힐스 2만원*4명'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '순천 파인힐스' AND gc.contact_name = '예약실';

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
WHERE gc.golf_course_name = '싱싱골프' AND gc.contact_name = '유중현';

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
WHERE gc.golf_course_name = '싱싱골프' AND gc.contact_name = '박주희';

-- 2024년 2월 7일: 스타벅스 상품권 (270,000원) → 영덕오션비치 3만*5명, 순천파인힐스 3만*4명 (설날)
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
  '설날',
  '스타벅스 상품권',
  150000,
  5,
  '2024-02-07'::DATE,
  '관리자',
  '영덕오션비치 3만*5명'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '영덕 오션비치' AND gc.contact_name = '예약실';

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
  '설날',
  '스타벅스 상품권',
  120000,
  4,
  '2024-02-07'::DATE,
  '관리자',
  '순천파인힐스 3만*4명'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '순천 파인힐스' AND gc.contact_name = '예약실';

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
WHERE gc.golf_course_name = '싱싱골프' AND gc.contact_name = '김성팔';

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
WHERE gc.golf_course_name = '싱싱골프' AND gc.contact_name = '신정란';

-- 2024년 9월 11일: 스타벅스 상품권 (270,000원) → 순천파인힐스 3만*4명, 영덕오션비치 3만*5명 (추석)
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
  '추석',
  '스타벅스 상품권',
  120000,
  4,
  '2024-09-11'::DATE,
  '관리자',
  '순천파인힐스 3만*4명'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '순천 파인힐스' AND gc.contact_name = '예약실';

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
  '추석',
  '스타벅스 상품권',
  150000,
  5,
  '2024-09-11'::DATE,
  '관리자',
  '영덕오션비치 3만*5명'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '영덕 오션비치' AND gc.contact_name = '예약실';

-- 2025년 10월 2일: 스타벅스 상품권 (300,000원) → 영덕오션비치 3만*5명, 순천파인힐스 3만*5명 (추석)
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
  '추석',
  '스타벅스 상품권',
  150000,
  5,
  '2025-10-02'::DATE,
  '관리자',
  '영덕오션비치 3만*5명'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '영덕 오션비치' AND gc.contact_name = '예약실';

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
  '추석',
  '스타벅스 상품권',
  150000,
  5,
  '2025-10-02'::DATE,
  '관리자',
  '순천파인힐스 3만*5명'
FROM golf_course_contacts gc 
WHERE gc.golf_course_name = '순천 파인힐스' AND gc.contact_name = '예약실';
