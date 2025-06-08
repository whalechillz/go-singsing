-- Storage 정책 수정 (더 유연한 정책)

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;

-- 1. 공개 읽기 허용
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'tourist-attractions');

-- 2. 모든 사용자 업로드 허용 (임시)
CREATE POLICY "Anyone can upload" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'tourist-attractions');

-- 3. 모든 사용자 삭제 허용 (임시)
CREATE POLICY "Anyone can delete" ON storage.objects
FOR DELETE 
USING (bucket_id = 'tourist-attractions');

-- 4. 모든 사용자 업데이트 허용 (임시)
CREATE POLICY "Anyone can update" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'tourist-attractions');