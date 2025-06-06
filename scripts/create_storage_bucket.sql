-- Supabase Storage 버킷 생성
-- 이 SQL은 Supabase Dashboard의 SQL Editor에서 실행해주세요

-- 1. tourist-attractions 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tourist-attractions',
  'tourist-attractions', 
  true, -- 공개 버킷
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. 버킷 정책 설정 (공개 읽기 허용)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'tourist-attractions');

-- 3. 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tourist-attractions' 
  AND auth.role() = 'authenticated'
);

-- 4. 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tourist-attractions' 
  AND auth.role() = 'authenticated'
);

-- 5. 인증된 사용자만 업데이트 가능
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'tourist-attractions' 
  AND auth.role() = 'authenticated'
);