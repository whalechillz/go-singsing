-- 관광지 마스터 테이블 생성
CREATE TABLE IF NOT EXISTS tourist_attractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('tourist_spot', 'rest_area', 'restaurant', 'shopping', 'activity')),
  address TEXT,
  description TEXT,
  features TEXT[], -- 특징들 (예: ['템플스테이 체험', '불교 문화재'])
  image_urls TEXT[], -- 여러 이미지 URL
  main_image_url TEXT, -- 대표 이미지
  operating_hours TEXT,
  contact_info TEXT,
  recommended_duration INTEGER DEFAULT 60, -- 추천 체류시간(분)
  tags TEXT[], -- ['포토존', '명소', '휴게소' 등]
  region VARCHAR(100), -- 지역 (예: '전남 순천')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 일정 항목 타입 확장을 위한 ENUM 추가 (기존 테이블 수정)
-- schedule_items JSONB 구조 확장
-- type: 'normal' | 'tourist_single' | 'tourist_options'
-- tourist_options일 경우 attraction_ids: string[] 추가

-- 투어-관광지 옵션 연결 테이블
CREATE TABLE IF NOT EXISTS tour_schedule_tourist_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES singsing_schedules(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  time_slot VARCHAR(10), -- '10:00' 등
  attraction_ids UUID[], -- 선택 가능한 관광지 ID 배열
  is_required BOOLEAN DEFAULT false, -- 필수 선택 여부
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_tourist_attractions_category ON tourist_attractions(category);
CREATE INDEX idx_tourist_attractions_region ON tourist_attractions(region);
CREATE INDEX idx_tourist_attractions_active ON tourist_attractions(is_active);
CREATE INDEX idx_tour_schedule_tourist_options_tour ON tour_schedule_tourist_options(tour_id);

-- 샘플 데이터 (선택사항)
INSERT INTO tourist_attractions (name, category, address, description, features, main_image_url, recommended_duration, tags, region) VALUES
('송광사', 'tourist_spot', '전남 순천시 송광면 송광사안길 100', '한국 불교의 삼보사찰 중 승보사찰', ARRAY['천년 고찰', '템플스테이 체험 가능', '아름다운 계곡'], NULL, 90, ARRAY['사찰', '문화재', '포토존'], '전남 순천'),
('보성 녹차밭', 'tourist_spot', '전남 보성군 보성읍 녹차로 763', '대한민국 대표 녹차 재배지', ARRAY['드넓은 녹차밭 전망', '녹차 아이스크림', '포토존'], NULL, 120, ARRAY['자연', '포토존', '체험'], '전남 보성'),
('순천만 습지', 'tourist_spot', '전남 순천시 순천만길 513-25', '세계 5대 연안습지', ARRAY['갈대밭 산책로', '순천만 전망대', '철새 관찰'], NULL, 90, ARRAY['자연', '생태', '포토존'], '전남 순천'),
('남대문', 'tourist_spot', '서울특별시 중구 세종대로 40', '대한민국 국보 제1호, 서울의 대표적인 문화재', ARRAY['국보 제1호', '조선시대 건축물', '서울의 랜드마크'], 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Namdaemun.jpg/1200px-Namdaemun.jpg', 60, ARRAY['문화재', '역사', '랜드마크', '포토존'], '서울')
ON CONFLICT DO NOTHING;

-- 코멘트 추가
COMMENT ON TABLE tourist_attractions IS '관광지 마스터 데이터';
COMMENT ON COLUMN tourist_attractions.category IS '관광지 카테고리: tourist_spot(관광명소), rest_area(휴게소), restaurant(맛집), shopping(쇼핑), activity(액티비티)';
COMMENT ON COLUMN tourist_attractions.recommended_duration IS '추천 체류시간(분)';

COMMENT ON TABLE tour_schedule_tourist_options IS '투어 일정별 선택 가능한 관광지 옵션';
COMMENT ON COLUMN tour_schedule_tourist_options.attraction_ids IS '고객이 선택할 수 있는 관광지 ID 목록';
