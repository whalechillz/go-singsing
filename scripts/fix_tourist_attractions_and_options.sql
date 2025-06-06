-- 1. tour_attraction_options 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS tour_attraction_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES singsing_tours(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES singsing_schedules(id) ON DELETE CASCADE,
  attraction_id UUID REFERENCES tourist_attractions(id) ON DELETE CASCADE,
  additional_price INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  order_no INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tour_attraction_options_tour ON tour_attraction_options(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_attraction_options_schedule ON tour_attraction_options(schedule_id);

-- 2. 관광지 이미지 업데이트
UPDATE tourist_attractions 
SET 
  main_image_url = 'https://cdn.pixabay.com/photo/2015/09/09/17/18/green-tea-plantation-932397_1280.jpg',
  image_urls = ARRAY[
    'https://cdn.pixabay.com/photo/2020/05/12/08/17/green-tea-5161747_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/05/30/14/10/green-tea-field-1424733_1280.jpg'
  ],
  features = ARRAY[
    '드넓은 녹차밭 전망',
    '녹차 아이스크림',
    '포토존',
    '녹차 체험 프로그램'
  ],
  description = '대한민국 대표 녹차 재배지로 아름다운 녹차밭 풍경을 감상할 수 있습니다',
  updated_at = NOW()
WHERE name = '보성 녹차밭';

-- 송광사 이미지 업데이트
UPDATE tourist_attractions 
SET 
  main_image_url = 'https://cdn.pixabay.com/photo/2019/11/14/02/05/temple-4625073_1280.jpg',
  image_urls = ARRAY[
    'https://cdn.pixabay.com/photo/2020/10/08/12/40/temple-5637796_1280.jpg'
  ],
  description = '한국 불교의 삼보사찰 중 승보사찰로 천년의 역사를 간직한 고찰입니다',
  updated_at = NOW()
WHERE name = '송광사';

-- 순천만 습지 이미지 업데이트
UPDATE tourist_attractions 
SET 
  main_image_url = 'https://cdn.pixabay.com/photo/2017/10/23/05/56/beach-2880261_1280.jpg',
  image_urls = ARRAY[
    'https://cdn.pixabay.com/photo/2016/11/14/04/14/bay-1822607_1280.jpg',
    'https://cdn.pixabay.com/photo/2019/12/14/12/15/suncheon-4694798_1280.jpg'
  ],
  description = '세계 5대 연안습지 중 하나로 아름다운 갈대밭과 철새를 관찰할 수 있습니다',
  updated_at = NOW()
WHERE name = '순천만 습지';

-- 3. 샘플 투어에 관광지 옵션 추가 (투어 ID와 스케줄 ID는 실제 값으로 변경 필요)
-- 먼저 투어와 스케줄 확인
WITH tour_info AS (
  SELECT 
    t.id as tour_id,
    s.id as schedule_id,
    s.day_number,
    s.date
  FROM singsing_tours t
  JOIN singsing_schedules s ON s.tour_id = t.id
  WHERE t.title LIKE '%순천%' 
  ORDER BY s.day_number
  LIMIT 3
),
attractions AS (
  SELECT id, name FROM tourist_attractions 
  WHERE name IN ('보성 녹차밭', '송광사', '순천만 습지')
)
-- 각 일정에 관광지 옵션 추가
INSERT INTO tour_attraction_options (tour_id, schedule_id, attraction_id, order_no, is_default)
SELECT 
  ti.tour_id,
  ti.schedule_id,
  a.id,
  CASE 
    WHEN a.name = '순천만 습지' THEN 1
    WHEN a.name = '보성 녹차밭' THEN 2
    WHEN a.name = '송광사' THEN 3
  END as order_no,
  CASE 
    WHEN ti.day_number = 1 AND a.name = '순천만 습지' THEN true
    WHEN ti.day_number = 2 AND a.name = '보성 녹차밭' THEN true
    WHEN ti.day_number = 3 AND a.name = '송광사' THEN true
    ELSE false
  END as is_default
FROM tour_info ti
CROSS JOIN attractions a
ON CONFLICT DO NOTHING;
