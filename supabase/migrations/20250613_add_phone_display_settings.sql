-- Add phone_display_settings column to singsing_tours table
ALTER TABLE singsing_tours
ADD COLUMN IF NOT EXISTS phone_display_settings JSONB DEFAULT '{
  "customer_schedule": {
    "show_company_phone": true,
    "show_driver_phone": false,
    "show_guide_phone": false,
    "show_golf_phone": false
  },
  "customer_boarding": {
    "show_company_phone": true,
    "show_driver_phone": true,
    "show_guide_phone": false
  },
  "staff_boarding": {
    "show_company_phone": true,
    "show_driver_phone": true,
    "show_guide_phone": true,
    "show_manager_phone": true
  },
  "room_assignment": {
    "show_company_phone": true,
    "show_driver_phone": true,
    "show_guide_phone": false
  },
  "room_assignment_staff": {
    "show_company_phone": true,
    "show_driver_phone": true,
    "show_guide_phone": true,
    "show_manager_phone": true
  },
  "tee_time": {
    "show_company_phone": true,
    "show_golf_phone": true
  },
  "simplified": {
    "show_company_phone": true
  }
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN singsing_tours.phone_display_settings IS '문서별 전화번호 표시 설정';
