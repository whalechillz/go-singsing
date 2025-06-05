-- 문서 관리 시스템 데이터베이스 스키마
-- Supabase SQL

-- 1. 문서 카테고리 테이블
CREATE TABLE documentation_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. 문서 테이블
CREATE TABLE documentation_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES documentation_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    author_id UUID,
    featured_image VARCHAR(500),
    meta_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 3. 문서 버전 관리 테이블
CREATE TABLE documentation_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES documentation_posts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT,
    change_summary TEXT,
    author_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. 문서 첨부파일 테이블
CREATE TABLE documentation_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES documentation_posts(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. 코드 스니펫 테이블
CREATE TABLE documentation_code_snippets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES documentation_posts(id) ON DELETE CASCADE,
    title VARCHAR(200),
    language VARCHAR(50),
    code TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인덱스 생성
CREATE INDEX idx_documentation_posts_category ON documentation_posts(category_id);
CREATE INDEX idx_documentation_posts_status ON documentation_posts(status);
CREATE INDEX idx_documentation_posts_tags ON documentation_posts USING GIN(tags);
CREATE INDEX idx_documentation_posts_slug ON documentation_posts(slug);

-- 초기 카테고리 데이터 삽입
INSERT INTO documentation_categories (name, slug, icon, display_order) VALUES
('디자인 시스템', 'design-system', '🎨', 1),
('데이터베이스', 'database', '🗄️', 2),
('설치 가이드', 'installation', '🚀', 3),
('API 문서', 'api-docs', '📡', 4),
('컴포넌트', 'components', '🧩', 5),
('업데이트 로그', 'changelog', '📝', 6);

-- 뷰 카운트 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE documentation_posts 
    SET view_count = view_count + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 타임스탬프 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documentation_posts_updated_at 
    BEFORE UPDATE ON documentation_posts
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentation_categories_updated_at 
    BEFORE UPDATE ON documentation_categories
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
