#!/bin/bash
# chmod +x create-mms-bucket.sh

# Supabase Storage 버킷 생성 스크립트
# MMS 이미지 업로드를 위한 버킷 생성

echo "🗄️  Supabase Storage 버킷 생성 스크립트"
echo "======================================="

# .env.local 파일에서 환경변수 로드
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ .env.local 파일을 찾을 수 없습니다."
    exit 1
fi

echo "
-- mms-images 버킷 생성 및 정책 설정
-- Supabase SQL Editor에서 실행하세요

-- 버킷이 이미 존재하는지 확인하고 없으면 생성
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('mms-images', 'mms-images', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS \"Public Access\" ON storage.objects;
DROP POLICY IF EXISTS \"Authenticated users can upload\" ON storage.objects;
DROP POLICY IF EXISTS \"Authenticated users can update\" ON storage.objects;
DROP POLICY IF EXISTS \"Authenticated users can delete\" ON storage.objects;

-- 공개 읽기 정책
CREATE POLICY \"Public Access\" ON storage.objects
FOR SELECT USING (bucket_id = 'mms-images');

-- 인증된 사용자 업로드 정책
CREATE POLICY \"Authenticated users can upload\" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mms-images');

-- 인증된 사용자 수정 정책
CREATE POLICY \"Authenticated users can update\" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'mms-images');

-- 인증된 사용자 삭제 정책
CREATE POLICY \"Authenticated users can delete\" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'mms-images');

-- 익명 사용자도 업로드 가능하도록 설정 (필요한 경우)
CREATE POLICY \"Anon users can upload\" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'mms-images');
"

echo ""
echo "✅ 위의 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요."
echo ""
echo "또는 다음 URL에서 직접 버킷을 생성할 수 있습니다:"
echo "https://app.supabase.com/project/${NEXT_PUBLIC_SUPABASE_URL#https://}/storage/buckets"
echo ""
echo "버킷 설정:"
echo "- Name: mms-images"
echo "- Public bucket: ✅ (체크)"
echo "- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif"
echo "- Max file size: 5MB"
