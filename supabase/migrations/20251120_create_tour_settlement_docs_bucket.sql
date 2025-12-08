-- tour-settlement-docs 버킷 생성 및 RLS 정책 설정
-- 이미 존재하면 중복 생성 없이 넘어가도록 처리

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'tour-settlement-docs',
  'tour-settlement-docs',
  false,
  20971520, -- 20MB
  ARRAY[]::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 기존 정책 삭제
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE polname = 'Authenticated users can upload settlement docs'
      AND schemaname = 'storage'
      AND tablename = 'objects'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can upload settlement docs" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE polname = 'Authenticated users can read settlement docs'
      AND schemaname = 'storage'
      AND tablename = 'objects'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can read settlement docs" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE polname = 'Authenticated users can delete settlement docs'
      AND schemaname = 'storage'
      AND tablename = 'objects'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can delete settlement docs" ON storage.objects';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE polname = 'Authenticated users can update settlement docs'
      AND schemaname = 'storage'
      AND tablename = 'objects'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can update settlement docs" ON storage.objects';
  END IF;
END $$;

-- 인증된 사용자 업로드
CREATE POLICY "Authenticated users can upload settlement docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tour-settlement-docs');

-- 인증된 사용자 읽기
CREATE POLICY "Authenticated users can read settlement docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'tour-settlement-docs');

-- 인증된 사용자 삭제
CREATE POLICY "Authenticated users can delete settlement docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tour-settlement-docs');

-- 인증된 사용자 업데이트
CREATE POLICY "Authenticated users can update settlement docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tour-settlement-docs');

