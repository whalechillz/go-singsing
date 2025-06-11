-- 통합 표지(포털) 기능을 위한 settings 컬럼 추가
ALTER TABLE public_document_links 
ADD COLUMN IF NOT EXISTS settings JSONB;

-- 코멘트 추가
COMMENT ON COLUMN public_document_links.settings IS '포털 페이지 설정 (테마, 연락처 정보 등)';

-- document_type에 대한 설명 업데이트
COMMENT ON COLUMN public_document_links.document_type IS '문서 타입: portal(통합 표지), customer_all(고객용 통합문서), staff_all(스탭용 통합문서), golf_timetable(골프장용 티타임표), customer_schedule(고객용 일정표), staff_schedule(스탭용 일정표), customer_boarding(고객용 탑승안내), staff_boarding(스탭용 탑승안내), room_assignment(고객용 객실배정), room_assignment_staff(스탭용 객실배정), customer_timetable(고객용 티타임표), staff_timetable(스탭용 티타임표), simplified(간편일정), quote(견적서)';
