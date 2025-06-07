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