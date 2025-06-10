-- public_document_links 테이블 확인 및 수정
-- 먼저 현재 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'public_document_links';

-- access_token이 아직 존재한다면 public_url로 변경
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'public_document_links' 
               AND column_name = 'access_token') THEN
        ALTER TABLE public_document_links RENAME COLUMN access_token TO public_url;
    END IF;
END $$;

-- 필수 컬럼 추가 (없는 경우만)
ALTER TABLE public_document_links 
ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

-- 인덱스 재생성
DROP INDEX IF EXISTS idx_public_document_links_access_token;
CREATE INDEX IF NOT EXISTS idx_public_document_links_public_url ON public_document_links(public_url);