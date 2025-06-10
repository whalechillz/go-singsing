-- 공개 문서 링크 테이블 생성
CREATE TABLE IF NOT EXISTS public_document_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id UUID NOT NULL REFERENCES singsing_tours(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- customer_schedule, staff_schedule, customer_boarding, staff_boarding
    access_token VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_public_document_links_tour_id ON public_document_links(tour_id);
CREATE INDEX idx_public_document_links_access_token ON public_document_links(access_token);
CREATE INDEX idx_public_document_links_is_active ON public_document_links(is_active);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_public_document_links_updated_at 
    BEFORE UPDATE ON public_document_links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE public_document_links IS '투어 문서의 공개 링크를 관리하는 테이블';
COMMENT ON COLUMN public_document_links.document_type IS '문서 타입: customer_schedule(고객용 일정표), staff_schedule(스탭용 일정표), customer_boarding(고객용 탑승안내), staff_boarding(스탭용 탑승안내)';
COMMENT ON COLUMN public_document_links.access_token IS '공개 접근용 고유 토큰';
COMMENT ON COLUMN public_document_links.expires_at IS '링크 만료 시간 (NULL이면 무제한)';
COMMENT ON COLUMN public_document_links.view_count IS '조회수';
