// utils/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

// 서버 사이드 전용 (Service Role Key 사용)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Vercel에 설정 필요
);

// 이미지 업로드 API Route 사용
export const uploadImageServer = async (
  file: File,
  bucket: string = 'tourist-attractions',
  folder: string = ''
) => {
  // 서버 사이드에서 처리
};