import "../globals.css";
import AppHeader from "@/components/AppHeader";

const navItems = [
  { label: "투어 안내", href: "/" },
  { label: "상품 안내", href: "/product-info" },
  { label: "여행 서류", href: "/document" },
  { label: "투어 일정표", href: "/tour-schedule" },
  // 필요시 추가
];

export const metadata = {
  title: "싱싱골프투어",
  description: "싱싱골프투어 고객 포털",
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
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