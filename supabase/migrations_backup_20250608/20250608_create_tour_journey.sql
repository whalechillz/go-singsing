-- 투어별 여정 관리 테이블 생성
CREATE TABLE IF NOT EXISTS tour_journey_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  
  -- 장소 정보 (둘 중 하나만 사용)
  boarding_place_id UUID REFERENCES singsing_boarding_places(id),
  spot_id UUID REFERENCES tourist_attractions(id),
  
  -- 시간 정보
  arrival_time TIME,
  departure_time TIME,
  stay_duration VARCHAR(50),
  
  -- 거리/소요시간 정보
  distance_from_prev VARCHAR(50),
  duration_from_prev VARCHAR(50),
  
  -- 탑승 정보 (탑승지인 경우만)
  passenger_count INTEGER,
  boarding_type VARCHAR(50), -- '승차', '하차', '경유'
  
  -- 식사 정보 (식당/클럽식인 경우)
  meal_type VARCHAR(50), -- '조식', '중식', '석식', '간식'
  meal_menu TEXT,
  
  -- 골프 정보 (골프장인 경우)
  golf_info JSONB,
  
  -- 기타 정보
  notes TEXT,
  display_options JSONB, -- 이미지 표시 여부 등 표시 옵션
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 복합 유니크 제약조건
  UNIQUE(tour_id, day_number, order_index)
);

-- 인덱스 생성
CREATE INDEX idx_tour_journey_tour_id ON tour_journey_items(tour_id);
CREATE INDEX idx_tour_journey_day ON tour_journey_items(tour_id, day_number);
CREATE INDEX idx_tour_journey_order ON tour_journey_items(tour_id, day_number, order_index);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_tour_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tour_journey_items_updated_at 
BEFORE UPDATE ON tour_journey_items 
FOR EACH ROW 
EXECUTE FUNCTION update_tour_journey_updated_at();

-- 코멘트 추가
COMMENT ON TABLE tour_journey_items IS '투어별 여정 항목';
COMMENT ON COLUMN tour_journey_items.boarding_place_id IS '탑승지 ID (탑승지인 경우)';
COMMENT ON COLUMN tour_journey_items.spot_id IS '스팟 ID (관광지, 식당, 휴게소 등인 경우)';
COMMENT ON COLUMN tour_journey_items.boarding_type IS '탑승 유형: 승차, 하차, 경유';
COMMENT ON COLUMN tour_journey_items.meal_type IS '식사 유형: 조식, 중식, 석식, 간식';
COMMENT ON COLUMN tour_journey_items.display_options IS '표시 옵션 JSON (이미지 표시 여부 등)';
