-- public_document_links 테이블 수정
-- access_token을 public_url로 변경하고 quote 타입 추가

-- 기존 컬럼명 변경
ALTER TABLE public_document_links 
RENAME COLUMN access_token TO public_url;

-- 조회 추적을 위한 컬럼 추가
ALTER TABLE public_document_links
ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

-- document_type에 quote 추가를 위한 체크 제약 제거 및 재생성
ALTER TABLE public_document_links 
DROP CONSTRAINT IF EXISTS public_document_links_document_type_check;

-- 코멘트 업데이트
COMMENT ON COLUMN public_document_links.document_type IS '문서 타입: quote(견적서), customer_schedule(고객용 일정표), staff_schedule(스탭용 일정표), customer_boarding(고객용 탑승안내), staff_boarding(스탭용 탑승안내)';
COMMENT ON COLUMN public_document_links.public_url IS '공개 접근용 고유 URL 경로';
COMMENT ON COLUMN public_document_links.first_viewed_at IS '최초 조회 시간';
COMMENT ON COLUMN public_document_links.last_viewed_at IS '마지막 조회 시간';