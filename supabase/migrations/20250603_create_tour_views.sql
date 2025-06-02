-- 투어 일정 통합 뷰 생성
CREATE OR REPLACE VIEW tour_schedule_full_view AS
SELECT 
  t.id as tour_id,
  t.title as tour_title,
  t.start_date,
  t.end_date,
  t.golf_course,
  t.accommodation,
  t.price,
  t.max_participants,
  t.includes,
  t.excludes,
  t.show_staff_info,
  t.show_footer_message,
  t.show_company_phones,
  t.show_golf_phones,
  t.footer_message,
  t.company_phone,
  t.company_mobile,
  t.golf_reservation_phone,
  t.golf_reservation_mobile,
  t.notices,
  t.reservation_notices,
  t.other_notices,
  t.document_settings,
  -- 여행상품 정보
  p.id as product_id,
  p.name as product_name,
  p.golf_course as product_golf_course,
  p.hotel as product_hotel,
  p.golf_courses as product_golf_courses,
  p.included_items as product_included_items,
  p.excluded_items as product_excluded_items,
  p.accommodation_info as product_accommodation_info,
  p.general_notices as product_general_notices,
  p.courses as product_courses,
  p.usage_round,
  p.usage_hotel,
  p.usage_meal,
  p.usage_locker,
  p.usage_bus,
  p.usage_tour,
  -- 스탭 정보 (JSON 배열)
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', s.id,
          'name', s.name,
          'phone', s.phone,
          'role', s.role,
          'display_order', s.display_order
        ) ORDER BY s.display_order
      )
      FROM singsing_tour_staff s
      WHERE s.tour_id = t.id
    ), 
    '[]'::json
  ) as staff,
  -- 일정 정보 (JSON 배열)
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'day_number', ds.day_number,
          'date', ds.date,
          'meal_breakfast', ds.meal_breakfast,
          'meal_lunch', ds.meal_lunch,
          'meal_dinner', ds.meal_dinner,
          'menu_breakfast', ds.menu_breakfast,
          'menu_lunch', ds.menu_lunch,
          'menu_dinner', ds.menu_dinner,
          'boarding_time', ds.boarding_time,
          'boarding_info', ds.boarding_info,
          'schedule_items', COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'order_num', si.order_num,
                  'time', si.time,
                  'content', si.content,
                  'golf_course', si.golf_course,
                  'notes', si.notes
                ) ORDER BY si.order_num
              )
              FROM tour_schedule_items si
              WHERE si.schedule_id = ds.id
            ),
            '[]'::json
          )
        ) ORDER BY ds.day_number
      )
      FROM tour_daily_schedules ds
      WHERE ds.tour_id = t.id
    ),
    '[]'::json
  ) as schedules,
  -- 문서별 공지사항 (JSON 객체)
  COALESCE(
    (
      SELECT json_object_agg(
        dn.document_type,
        dn.notices
      )
      FROM document_notices dn
      WHERE dn.tour_id = t.id
    ),
    '{}'::json
  ) as document_notices
FROM singsing_tours t
LEFT JOIN tour_products p ON t.golf_course = p.name;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tour_schedule_full_view_tour_id ON singsing_tours(id);
CREATE INDEX IF NOT EXISTS idx_tour_schedule_full_view_product_name ON tour_products(name);

-- 권한 설정
GRANT SELECT ON tour_schedule_full_view TO authenticated;

-- 문서 생성 상태를 확인하는 뷰
CREATE OR REPLACE VIEW tour_document_status AS
SELECT 
  t.id as tour_id,
  t.title as tour_title,
  t.start_date,
  t.end_date,
  t.document_settings,
  -- 각 문서 타입별 생성 여부
  EXISTS (
    SELECT 1 FROM document_notices dn 
    WHERE dn.tour_id = t.id AND dn.document_type = 'customer_schedule'
  ) as has_customer_schedule,
  EXISTS (
    SELECT 1 FROM document_notices dn 
    WHERE dn.tour_id = t.id AND dn.document_type = 'customer_boarding'
  ) as has_customer_boarding,
  EXISTS (
    SELECT 1 FROM document_notices dn 
    WHERE dn.tour_id = t.id AND dn.document_type = 'staff_boarding'
  ) as has_staff_boarding,
  EXISTS (
    SELECT 1 FROM document_notices dn 
    WHERE dn.tour_id = t.id AND dn.document_type = 'room_assignment'
  ) as has_room_assignment,
  EXISTS (
    SELECT 1 FROM document_notices dn 
    WHERE dn.tour_id = t.id AND dn.document_type = 'tee_time'
  ) as has_tee_time,
  EXISTS (
    SELECT 1 FROM document_notices dn 
    WHERE dn.tour_id = t.id AND dn.document_type = 'simplified'
  ) as has_simplified,
  -- 참가자 수
  (
    SELECT COUNT(*) 
    FROM singsing_participants p 
    WHERE p.tour_id = t.id AND p.status = '확정'
  ) as confirmed_participants,
  -- 객실 배정 수
  (
    SELECT COUNT(DISTINCT ra.room_number) 
    FROM room_assignments ra 
    WHERE ra.tour_id = t.id
  ) as assigned_rooms,
  -- 티타임 배정 수
  (
    SELECT COUNT(*) 
    FROM tee_time_assignments tta 
    WHERE tta.tour_id = t.id
  ) as assigned_tee_times
FROM singsing_tours t;

-- 권한 설정
GRANT SELECT ON tour_document_status TO authenticated;

-- 코멘트 추가
COMMENT ON VIEW tour_schedule_full_view IS '투어 일정과 여행상품 정보를 통합한 뷰';
COMMENT ON VIEW tour_document_status IS '투어별 문서 생성 상태를 확인하는 뷰';