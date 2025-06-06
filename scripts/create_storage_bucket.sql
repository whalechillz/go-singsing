-- Supabase Storage 버킷 생성 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. tourist-attractions 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tourist-attractions',
  'tourist-attractions', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[];

-- 2. 버킷에 대한 정책 생성
-- 모든 사용자가 읽기 가능
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'tourist-attractions');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tourist-attractions' 
    AND auth.role() = 'authenticated'
  );

-- 인증된 사용자만 삭제 가능  
CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tourist-attractions' 
    AND auth.role() = 'authenticated'
  );

-- 3. 버킷 설정 확인
SELECT * FROM storage.buckets WHERE id = 'tourist-attractions';
