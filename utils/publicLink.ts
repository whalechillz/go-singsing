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
 * @returns 전체 공개 링크 URL
 */
export function getPublicLinkUrl(publicUrl: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/q/${publicUrl}`;
  }
  return `/q/${publicUrl}`;
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
