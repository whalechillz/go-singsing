-- 남대문 이미지 업데이트 또는 추가
-- 먼저 남대문이 이미 존재하는지 확인하고 업데이트, 없으면 추가

-- 남대문이 이미 존재하는지 확인
DO $
BEGIN
  -- 남대문이 존재하는지 확인
  IF EXISTS (SELECT 1 FROM tourist_attractions WHERE name = '남대문') THEN
    -- 존재하면 업데이트
    UPDATE tourist_attractions 
    SET 
      main_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Namdaemun.jpg/1200px-Namdaemun.jpg',
      description = '대한민국 국보 제1호, 서울의 대표적인 문화재',
      features = ARRAY['국보 제1호', '조선시대 건축물', '서울의 랜드마크'],
      tags = ARRAY['문화재', '역사', '랜드마크', '포토존'],
      updated_at = NOW()
    WHERE name = '남대문';
    
    RAISE NOTICE '남대문 데이터가 업데이트되었습니다.';
  ELSE
    -- 존재하지 않으면 추가
    INSERT INTO tourist_attractions (
      name, 
      category, 
      address, 
      description, 
      main_image_url,
      features, 
      recommended_duration, 
      tags, 
      region,
      is_active
    ) VALUES (
      '남대문',
      'tourist_spot',
      '서울특별시 중구 세종대로 40',
      '대한민국 국보 제1호, 서울의 대표적인 문화재',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Namdaemun.jpg/1200px-Namdaemun.jpg',
      ARRAY['국보 제1호', '조선시대 건축물', '서울의 랜드마크'],
      60,
      ARRAY['문화재', '역사', '랜드마크', '포토존'],
      '서울',
      true
    );
    
    RAISE NOTICE '남대문 데이터가 추가되었습니다.';
  END IF;
END $;

-- 남대문이 없는 경우를 대비한 직접 업데이트
UPDATE tourist_attractions 
SET 
  main_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Namdaemun.jpg/1200px-Namdaemun.jpg',
  updated_at = NOW()
WHERE name = '남대문' AND (main_image_url IS NULL OR main_image_url = '');

-- 확인
SELECT name, category, main_image_url 
FROM tourist_attractions 
WHERE name = '남대문';
