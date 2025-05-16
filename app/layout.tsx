// src/app/layout.tsx
import "./globals.css";
import AppHeader, { NavItem } from "@/components/AppHeader";

const navItems: NavItem[] = [
  { label: "투어 관리", href: "/admin/tours" },
  { label: "참가자 관리", href: "/admin/participants" },
  { label: "객실 배정", href: "/admin/rooms" },
  { label: "티오프", href: "/admin/tee-time" },
  { label: "탑승지", href: "/admin/boarding" },
];

export const metadata = {
  title: "싱싱골프투어 - 관리자",
  description: "싱싱골프투어 관리자 페이지",
};

export default function DeprecatedRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}