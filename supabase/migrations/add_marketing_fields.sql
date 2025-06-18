-- 마케팅용 포함사항/특별혜택/불포함사항 필드 추가
ALTER TABLE singsing_tours 
ADD COLUMN IF NOT EXISTS marketing_included_items jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS marketing_special_benefits jsonb DEFAULT '[]', 
ADD COLUMN IF NOT EXISTS marketing_excluded_items jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS use_marketing_content boolean DEFAULT false;

-- 각 항목은 다음과 같은 구조를 가집니다:
-- {
--   "icon": "🏨",
--   "title": "포함사항",
--   "items": [
--     {"text": "리무진 버스 (45인승 최고급 차량)", "highlight": false},
--     {"text": "그린피 및 카트비 (18홀 × 3일)", "highlight": false},
--     {"text": "호텔 2박 (2인 1실 기준)", "highlight": false}
--   ]
-- }