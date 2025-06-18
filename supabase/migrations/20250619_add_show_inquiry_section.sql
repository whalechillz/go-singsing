-- 투어별 문의사항 표시 설정 추가
ALTER TABLE singsing_tours
ADD COLUMN IF NOT EXISTS show_inquiry_section BOOLEAN DEFAULT true;

-- 컬럼에 대한 설명 추가
COMMENT ON COLUMN singsing_tours.show_inquiry_section IS '일정표에 문의사항 섹션 표시 여부 (기본값: true)';

-- 기존 투어들은 모두 true로 설정
UPDATE singsing_tours 
SET show_inquiry_section = true 
WHERE show_inquiry_section IS NULL;
