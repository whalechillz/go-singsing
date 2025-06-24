-- MMS 이미지용 Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('mms-images', 'mms-images', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- MMS 이미지 버킷에 대한 정책 설정
-- 업로드 권한 (인증된 사용자만)
CREATE POLICY "Authenticated users can upload mms images" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'mms-images');

-- 읽기 권한 (공개)
CREATE POLICY "Anyone can read mms images" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'mms-images');

-- 삭제 권한 (인증된 사용자만)
CREATE POLICY "Authenticated users can delete mms images" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'mms-images');

-- 업데이트 권한 (인증된 사용자만)
CREATE POLICY "Authenticated users can update mms images" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'mms-images');