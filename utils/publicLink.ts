/**
 * 공개 링크용 랜덤 URL 생성
 * @returns 8자리 랜덤 문자열
 */
export function generatePublicUrl(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 공개 링크 URL 생성
 * @param publicUrl public_document_links 테이블의 public_url
 * @param isQuote 견적서 여부 (true면 /q/, false면 /s/ 사용)
 * @returns 전체 공개 링크 URL
 */
export function getPublicLinkUrl(publicUrl: string, isQuote: boolean = false): string {
  if (typeof window !== 'undefined') {
    const path = isQuote ? 'q' : 's';
    return `${window.location.origin}/${path}/${publicUrl}`;
  }
  const path = isQuote ? 'q' : 's';
  return `/${path}/${publicUrl}`;
}

/**
 * 내부 견적서 링크 URL 생성
 * @param tourId 투어 ID
 * @returns 전체 내부 링크 URL
 */
export function getInternalQuoteUrl(tourId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/quote/${tourId}`;
  }
  return `/quote/${tourId}`;
}
