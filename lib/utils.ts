import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 코스명 간소화 함수 ("골프장명 - 코스명" → "코스명")
export function simplifyCourseName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.split(' - ');
  return parts.length > 1 ? parts[1] : fullName;
}

// 숫자를 천단위 콤마가 포함된 문자열로 변환 (0일 때는 빈 문자열)
export function formatNumberWithCommas(value: number | undefined | null): string {
  if (value === undefined || value === null || value === 0) return "";
  return value.toLocaleString("ko-KR");
}

// 천단위 콤마가 포함된 문자열을 숫자로 변환
export function parseNumberFromString(str: string): number {
  if (!str || str.trim() === "") return 0;
  const cleaned = str.replace(/,/g, "");
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// 숫자 입력 핸들러 props 생성 (천단위 콤마 표시 및 0 초기화)
export function createNumberInputProps(
  value: number | undefined,
  onChange: (num: number) => void
) {
  return {
    type: "text" as const,
    value: formatNumberWithCommas(value),
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      // 0이면 빈 문자열로 초기화
      if (value === 0 || value === undefined || value === null) {
        e.target.value = "";
      }
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = parseNumberFromString(e.target.value);
      onChange(num);
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      // 빈 값이면 0으로 설정
      if (e.target.value.trim() === "") {
        onChange(0);
      }
    }
  };
} 