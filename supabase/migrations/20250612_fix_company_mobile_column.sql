-- company_mobile 컬럼이 없다면 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS company_mobile VARCHAR(50);

-- 기본값 설정 (필요한 경우)
UPDATE singsing_tours 
SET company_mobile = '010-3332-9020' 
WHERE company_mobile IS NULL;