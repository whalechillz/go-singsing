-- UUID 확장 모듈 활성화 (gen_random_uuid() 함수 사용을 위해)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 메모 템플릿 테이블 id 컬럼 수정
ALTER TABLE singsing_memo_templates 
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 테스트: UUID 생성 함수 확인
SELECT uuid_generate_v4();

-- 혹시 gen_random_uuid()가 없다면 uuid_generate_v4() 사용
ALTER TABLE singsing_memo_templates 
ALTER COLUMN id SET DEFAULT COALESCE(gen_random_uuid(), uuid_generate_v4());