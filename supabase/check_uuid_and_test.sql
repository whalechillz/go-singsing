-- 1. UUID 생성 함수 테스트
SELECT gen_random_uuid();
SELECT uuid_generate_v4();

-- 2. 현재 설치된 확장 확인
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 3. 템플릿 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'singsing_memo_templates'
ORDER BY ordinal_position;

-- 4. 테스트용 단일 템플릿 삽입
INSERT INTO singsing_memo_templates (category, title, content_template)
VALUES ('urgent', '테스트 템플릿', '테스트 내용');

-- 5. 삽입 결과 확인
SELECT * FROM singsing_memo_templates;