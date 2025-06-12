-- 투어 정보를 통합해서 보여주는 뷰 생성
CREATE OR REPLACE VIEW tour_complete_info AS
SELECT 
  t.*,
  -- 여행상품 정보
  tp.golf_course,
  tp.hotel,
  tp.golf_phone,
  tp.hotel_phone,
  -- 회사 설정 (설정 테이블이 있다면)
  COALESCE(t.company_phone, cs.company_phone, '031-215-3990') as display_company_phone,
  COALESCE(t.company_mobile, cs.company_mobile, '010-3332-9020') as display_company_mobile,
  COALESCE(t.footer_message, cs.default_footer_message, '♡ 즐거운 하루 되시길 바랍니다. ♡') as display_footer_message,
  -- 골프장 연락처는 상품에서
  COALESCE(t.golf_reservation_phone, tp.golf_phone) as display_golf_phone
FROM singsing_tours t
LEFT JOIN tour_products tp ON t.tour_product_id = tp.id
CROSS JOIN company_settings cs  -- 설정 테이블 (1개 row만 있다고 가정)
;