import "../globals.css";
import AppHeader from "@/components/AppHeader";

const navItems = [
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <AppHeader navItems={navItems} />
        <main>{children}</main>
      </body>
    </html>
  );
} 