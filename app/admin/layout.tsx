import "../globals.css";
import AdminSidebarLayout from "@/components/AdminSidebarLayout";

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
        <AdminSidebarLayout>
          {children}
        </AdminSidebarLayout>
      </body>
    </html>
  );
} 