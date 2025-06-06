-- 경유지 타입 추가 (휴게소, 마트, 관광지, 식당)
ALTER TABLE singsing_tour_boarding_times
ADD COLUMN waypoint_type VARCHAR(20)
CHECK (waypoint_type IN ('rest_area', 'mart', 'tourist_spot', 'restaurant'));

-- 장소 이미지 URL 추가
ALTER TABLE singsing_tour_boarding_times
ADD COLUMN image_url VARCHAR(500);

-- 코멘트 추가
COMMENT ON COLUMN singsing_tour_boarding_times.waypoint_type IS '경유지 타입: rest_area(휴게소), mart(마트), tourist_spot(관광지), restaurant(식당)';
COMMENT ON COLUMN singsing_tour_boarding_times.image_url IS '장소 이미지 URL';
