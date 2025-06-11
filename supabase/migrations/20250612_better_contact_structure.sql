-- 올바른 데이터 구조
-- 1. 설정 관리 테이블 (전사 기본값)
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_phone VARCHAR(50),
  company_mobile VARCHAR(50),
  default_footer_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 투어별 담당자는 singsing_tour_staff 활용
-- role이 '매니저', '인솔자', '담당자'인 스탭의 연락처 사용

-- 3. 투어 문서 생성시 연락처 우선순위
-- 1순위: 해당 투어의 담당 스탭 (singsing_tour_staff)
-- 2순위: 회사 기본 설정 (company_settings)
-- 3순위: 하드코딩된 기본값

-- 뷰 생성: 투어별 담당자 정보
CREATE OR REPLACE VIEW tour_contact_info AS
SELECT 
  t.id as tour_id,
  t.title,
  COALESCE(
    -- 1순위: 투어 담당자
    (SELECT phone FROM singsing_tour_staff 
     WHERE tour_id = t.id 
     AND role IN ('매니저', '인솔자', '담당자')
     ORDER BY display_order LIMIT 1),
    -- 2순위: 회사 기본 설정
    (SELECT company_mobile FROM company_settings LIMIT 1),
    -- 3순위: 기본값
    '010-3332-9020'
  ) as contact_phone,
  COALESCE(
    -- 담당자 이름
    (SELECT name FROM singsing_tour_staff 
     WHERE tour_id = t.id 
     AND role IN ('매니저', '인솔자', '담당자')
     ORDER BY display_order LIMIT 1),
    '담당자'
  ) as contact_name
FROM singsing_tours t;