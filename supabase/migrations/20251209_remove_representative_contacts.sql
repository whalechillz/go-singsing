-- 골프장 담당자에서 "대표" 항목 삭제
-- 협업 업체(partner_companies)에서 관리하도록 변경
-- 2025-12-09

-- 삭제 대상:
-- 1. position이 '대표'이고 contact_name이 '예약실' 또는 '대표'인 항목
-- 2. 특정 골프장명(세븐힐스, 순천 파인힐스, 영덕 오션비치, 영광 웨스트 오션)에서 position이 '대표'인 항목

DELETE FROM golf_course_contacts
WHERE (
  -- position이 '대표'이고 contact_name이 '예약실' 또는 '대표'인 경우
  (position = '대표' AND contact_name IN ('예약실', '대표'))
  OR
  -- 특정 골프장명에서 position이 '대표'인 경우
  (golf_course_name IN ('세븐힐스', '순천 파인힐스', '영덕 오션비치', '영광 웨스트 오션') 
   AND position = '대표')
);

-- 삭제된 항목 확인 (로깅용)
-- 삭제된 항목들은 협업 업체(partner_companies) 테이블에서 관리해야 함

