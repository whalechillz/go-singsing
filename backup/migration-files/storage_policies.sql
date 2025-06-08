-- Storage 정책 생성 (버킷은 미리 Dashboard에서 생성해야 함)

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;

-- 1. 공개 읽기 허용
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'tourist-attractions');

-- 2. 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tourist-attractions' 
  AND auth.role() = 'authenticated'
);

-- 3. 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tourist-attractions' 
  AND auth.role() = 'authenticated'
);

-- 4. 인증된 사용자만 업데이트 가능
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'tourist-attractions' 
  AND auth.role() = 'authenticated'
);