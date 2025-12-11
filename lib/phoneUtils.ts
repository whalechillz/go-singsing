/**
 * 전화번호 포맷팅 유틸리티
 */

/**
 * 전화번호 포맷팅 (010-XXXX-XXXX 형식)
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/-/g, "").replace(/\s/g, "").replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return cleaned;
};

/**
 * 전화번호 정규화 (하이픈 제거, 숫자만)
 */
export const normalizePhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "";
  return phone.replace(/-/g, "").replace(/\s/g, "").replace(/\D/g, "");
};

/**
 * 전화번호 입력 핸들러 (실시간 포맷팅)
 */
export const handlePhoneInputChange = (
  value: string,
  setValue: (value: string) => void
) => {
  const cleaned = value.replace(/-/g, "").replace(/\D/g, "");
  const limited = cleaned.slice(0, 11);
  let formatted = limited;
  if (limited.length > 7) {
    formatted = limited.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
  } else if (limited.length > 3) {
    formatted = limited.replace(/(\d{3})(\d+)/, "$1-$2");
  }
  setValue(formatted);
};

