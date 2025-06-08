-- 여정 장소 테이블 (journey_places)
CREATE TABLE journey_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('boarding', 'rest', 'tour', 'meal', 'hotel')),
  type VARCHAR(100) NOT NULL, -- 출발지, 경유지, 관광지, 중식, 석식, 휴게소 등
  time TIME, -- 도착 예정 시간
  passengers INT, -- 탑승 인원 (탑승지만 해당)
  distance VARCHAR(50), -- 이전 장소로부터의 거리
  duration VARCHAR(50), -- 이전 장소로부터의 소요시간
  stay_time VARCHAR(50), -- 체류 시간
  meal VARCHAR(255), -- 식당인 경우 메뉴
  notes TEXT, -- 비고
  latitude DECIMAL(10, 8), -- 위도 (지도 표시용)
  longitude DECIMAL(11, 8), -- 경도 (지도 표시용)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_journey_places_order ON journey_places(order);
CREATE INDEX idx_journey_places_category ON journey_places(category);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_journey_places_updated_at 
BEFORE UPDATE ON journey_places 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 (선택사항)
INSERT INTO journey_places (order, name, address, category, type, time, passengers, notes) VALUES
(1, '송광사', '전남 순천시 송광면 송광사안길 100', 'boarding', '출발지', '05:00', 15, '메인 출발지'),
(2, '부천체육관', '경기 부천시 원미구 석천로 293', 'boarding', '경유지', '06:00', 8, NULL),
(3, '평택휴게소', '경기도 평택시 서동대로 3825', 'rest', '휴게소', '07:30', NULL, '휴식 20분'),
(4, '웰팩대학교', '경기도 부천시 원미구 석천로 293', 'tour', '관광지', '09:00', NULL, '관광 1시간 30분'),
(5, '교보 식당', '주소 추가 필요', 'meal', '중식', '12:00', NULL, '한정식'),
(6, '보성 녹차밭', '전남 보성군 보성읍 녹차로 763', 'tour', '관광지', '14:00', NULL, '관광 2시간');

-- 거리/시간 정보 업데이트 (2번째 장소부터)
UPDATE journey_places SET distance = '85km', duration = '1시간' WHERE order = 2;
UPDATE journey_places SET distance = '120km', duration = '1시간 30분', stay_time = '20분' WHERE order = 3;
UPDATE journey_places SET distance = '45km', duration = '40분', stay_time = '1시간 30분' WHERE order = 4;
UPDATE journey_places SET distance = '15km', duration = '20분', stay_time = '1시간', meal = '한정식' WHERE order = 5;
UPDATE journey_places SET distance = '80km', duration = '1시간 20분', stay_time = '2시간' WHERE order = 6;
