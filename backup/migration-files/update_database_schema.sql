-- tourist_attractions 테이블 생성 (이미 있다면 건너뛰기)
CREATE TABLE IF NOT EXISTS tourist_attractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('tourist_spot', 'rest_area', 'restaurant', 'shopping', 'activity')),
  description TEXT,
  address TEXT,
  contact_info VARCHAR(100),
  operating_hours VARCHAR(255),
  main_image_url TEXT,
  image_urls TEXT[],
  recommended_duration INTEGER DEFAULT 60,
  features TEXT[],
  tags TEXT[],
  region VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_category ON tourist_attractions(category);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_is_active ON tourist_attractions(is_active);
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_name ON tourist_attractions(name);

-- singsing_schedules 테이블에 attraction_id 추가 (schedule_items JSONB 내부에 저장)
-- schedule_items 구조 예시:
-- [
--   {
--     "time": "09:00",
--     "content": "송광사",
--     "attraction_id": "uuid-here",
--     "attraction": { ... }
--   }
-- ]

-- singsing_boarding_places 테이블에 컬럼 추가
ALTER TABLE singsing_boarding_places 
ADD COLUMN IF NOT EXISTS place_type VARCHAR(50) DEFAULT 'boarding' CHECK (place_type IN ('boarding', 'rest_area', 'mart', 'tourist_spot', 'restaurant')),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES tourist_attractions(id);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- tourist_attractions 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_tourist_attractions_updated_at ON tourist_attractions;
CREATE TRIGGER update_tourist_attractions_updated_at 
BEFORE UPDATE ON tourist_attractions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();