import { supabase } from '@/lib/supabaseClient';

export const uploadImage = async (
  file: File,
  bucket: string = 'tourist-attractions',
  folder: string = ''
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // 환경 확인
    console.log('Environment:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      bucket,
      fileSize: file.size,
      fileType: file.type
    });
    
    // 파일 확장자 가져오기
    const fileExt = file.name.split('.').pop();
    // 유니크한 파일명 생성
    const fileName = `${folder}${folder ? '/' : ''}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Supabase Storage에 업로드
    console.log('Uploading file:', fileName, 'to bucket:', bucket);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error details:', {
        error,
        bucket,
        fileName,
        fileType: file.type,
        fileSize: file.size
      });
      return { url: null, error };
    }
    
    console.log('Upload successful:', data);

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { url: null, error: error as Error };
  }
};

export const deleteImage = async (
  url: string,
  bucket: string = 'tourist-attractions'
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // URL에서 파일 경로 추출
    const urlParts = url.split(`${bucket}/`);
    if (urlParts.length < 2) {
      return { success: false, error: new Error('Invalid URL') };
    }
    
    const filePath = urlParts[1];
    
    // Supabase Storage에서 삭제
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error as Error };
  }
};

  // 이미지 파일 유효성 검사
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  console.log('Validating file:', {
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    type: file.type
  });
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'JPG, PNG, WEBP 형식의 이미지만 업로드 가능합니다.' 
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `파일 크기는 5MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)` 
    };
  }
  
  return { valid: true };
};