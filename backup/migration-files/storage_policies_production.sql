-- Storage 정책 - 프로덕션용 (인증 필요)

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;

-- 1. 공개 읽기 허용 (이미지는 누구나 볼 수 있어야 함)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'tourist-attractions');

-- 2. 인증된 사용자만 업로드 (또는 특정 도메인에서만)
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'tourist-attractions' 
  AND (
    auth.role() = 'authenticated'
    OR auth.jwt() ->> 'iss' = 'https://go2.singsinggolf.kr'
  )
);

-- 3. 인증된 사용자만 삭제
CREATE POLICY "Authenticated delete" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'tourist-attractions' 
  AND auth.role() = 'authenticated'
);

-- 4. 인증된 사용자만 업데이트
CREATE POLICY "Authenticated update" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'tourist-attractions' 
  AND auth.role() = 'authenticated'
);