-- 보성 녹차밭 이미지 업데이트
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
  updated_at = NOW()
WHERE name = '보성 녹차밭';

-- 다른 관광지들도 이미지 추가
UPDATE tourist_attractions 
SET 
  main_image_url = 'https://cdn.pixabay.com/photo/2019/11/14/02/05/temple-4625073_1280.jpg',
  image_urls = ARRAY[
    'https://cdn.pixabay.com/photo/2020/10/08/12/40/temple-5637796_1280.jpg'
  ],
  updated_at = NOW()
WHERE name = '송광사';

UPDATE tourist_attractions 
SET 
  main_image_url = 'https://cdn.pixabay.com/photo/2017/10/23/05/56/beach-2880261_1280.jpg',
  image_urls = ARRAY[
    'https://cdn.pixabay.com/photo/2016/11/14/04/14/bay-1822607_1280.jpg',
    'https://cdn.pixabay.com/photo/2019/12/14/12/15/suncheon-4694798_1280.jpg'
  ],
  updated_at = NOW()
WHERE name = '순천만 습지';
