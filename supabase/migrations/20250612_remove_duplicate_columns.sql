-- company_mobile이 이미 설정 관리에 있다면 tours 테이블에서는 제거
-- 단, 투어별로 다른 담당자가 필요한 경우가 아니라면

-- 1. 뷰 생성: 투어 정보와 기본 설정 결합
CREATE OR REPLACE VIEW tours_with_settings AS
SELECT 
  t.*,
  COALESCE(t.company_phone, s.company_phone) as display_company_phone,
  COALESCE(t.company_mobile, s.company_mobile) as display_company_mobile,
  COALESCE(t.footer_message, s.default_footer_message) as display_footer_message
FROM singsing_tours t
CROSS JOIN system_settings s;  -- 설정 테이블명 확인 필요

-- 2. 또는 투어별 담당자가 필요하다면 staff와 연결
-- singsing_tour_staff에서 role='매니저' 또는 '인솔자'인 사람의 연락처 사용