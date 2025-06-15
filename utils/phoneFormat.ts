/**
 * 전화번호 관련 유틸리티 함수들
 */

/**
 * 전화번호에서 하이픈 제거
 * @param phone - 전화번호 (하이픈 포함 가능)
 * @returns 숫자만 있는 전화번호
 */
export function removePhoneHyphens(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[-\s]/g, '');
}

/**
 * 전화번호에 하이픈 추가 (한국 전화번호 형식)
 * @param phone - 숫자만 있는 전화번호
 * @returns 하이픈이 포함된 전화번호
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // 하이픈 제거
  const cleaned = removePhoneHyphens(phone);
  
  // 한국 휴대폰 번호 (010, 011, 016, 017, 018, 019)
  if (cleaned.match(/^01[0-9]/)) {
    if (cleaned.length === 10) {
      // 010-123-4567
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 11) {
      // 010-1234-5678
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
  }
  
  // 서울 지역번호 (02)
  if (cleaned.startsWith('02')) {
    if (cleaned.length === 9) {
      // 02-123-4567
      return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 10) {
      // 02-1234-5678
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    }
  }
  
  // 기타 지역번호 (031, 032, 033 등)
  if (cleaned.match(/^0[3-6][0-9]/)) {
    if (cleaned.length === 10) {
      // 031-123-4567
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 11) {
      // 031-1234-5678
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
  }
  
  // 1588, 1577 등 대표번호
  if (cleaned.match(/^1[0-9]{3}/)) {
    if (cleaned.length === 8) {
      // 1588-1234
      return cleaned.replace(/(\d{4})(\d{4})/, '$1-$2');
    }
  }
  
  // 그 외의 경우 원본 반환
  return phone;
}

/**
 * 전화번호 유효성 검사
 * @param phone - 검사할 전화번호
 * @returns 유효한 전화번호인지 여부
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = removePhoneHyphens(phone);
  
  // 한국 전화번호 패턴
  const patterns = [
    /^01[0-9]{8,9}$/,       // 휴대폰
    /^02\d{7,8}$/,          // 서울
    /^0[3-6][0-9]\d{7,8}$/, // 지역번호
    /^1[0-9]{3}\d{4}$/      // 대표번호
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * 전화번호 입력 시 실시간 포맷팅
 * @param value - 입력된 값
 * @param prevValue - 이전 값
 * @returns 포맷팅된 전화번호
 */
export function formatPhoneNumberOnInput(value: string, prevValue: string = ''): string {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');
  
  // 백스페이스로 하이픈을 지우려고 할 때
  if (value.length < prevValue.length) {
    return numbers;
  }
  
  // 포맷팅 적용
  return formatPhoneNumber(numbers);
}
