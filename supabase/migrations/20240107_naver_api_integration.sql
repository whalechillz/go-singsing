-- 네이버 API 통합을 위한 마이그레이션
-- 2024-01-07

-- 2. tourist_attractions 테이블에 네이버 API 관련 필드 추가
ALTER TABLE tourist_attractions 
ADD COLUMN IF NOT EXISTS naver_place_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS naver_category VARCHAR(255),
ADD COLUMN IF NOT EXISTS coordinates JSONB,
ADD COLUMN IF NOT EXISTS data_sources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS raw_search_data JSONB,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 3. 검색 캐시 테이블 생성
CREATE TABLE IF NOT EXISTS search_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query VARCHAR(255) NOT NULL,
  source VARCHAR(50) NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days',
  UNIQUE(query, source)
);

-- 4. API 사용 로그 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_name VARCHAR(50) NOT NULL,
  endpoint VARCHAR(255),
  cost DECIMAL(10,4),
  response_time INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ai_generation_history 테이블 개선
ALTER TABLE ai_generation_history
ADD COLUMN IF NOT EXISTS search_sources TEXT[],
ADD COLUMN IF NOT EXISTS api_cost DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS naver_data JSONB,
ADD COLUMN IF NOT EXISTS google_data JSONB;

-- 6. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_search_cache_query ON search_cache(query);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_naver_id ON tourist_attractions(naver_place_id);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_phone ON tourist_attractions(phone);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_sources ON tourist_attractions USING GIN(data_sources);

-- 7. 기존 데이터에 기본값 설정 (선택사항)
UPDATE tourist_attractions 
SET data_sources = ARRAY['manual']::TEXT[] 
WHERE data_sources IS NULL OR array_length(data_sources, 1) IS NULL;