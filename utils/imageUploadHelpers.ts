// 순차적 업로드 헬퍼 함수
export const uploadMultipleImages = async (
  files: File[],
  bucket: string = 'tourist-attractions',
  folder: string = '',
  onProgress?: (current: number, total: number) => void
): Promise<{ urls: string[]; errors: Error[] }> => {
  const urls: string[] = [];
  const errors: Error[] = [];
  
  for (let i = 0; i < files.length; i++) {
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
    
    try {
      const { url, error } = await uploadImage(files[i], bucket, folder);
      if (url) {
        urls.push(url);
      } else if (error) {
        errors.push(error);
      }
    } catch (error) {
      errors.push(error as Error);
    }
    
    // 각 업로드 사이에 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return { urls, errors };
};