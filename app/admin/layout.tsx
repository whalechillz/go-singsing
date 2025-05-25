import AdminSidebarLayout from "@/components/AdminSidebarLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "싱싱골프투어 - 관리자",
  description: "싱싱골프투어 관리자 페이지",
};

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <AdminSidebarLayout>
      {children}
    </AdminSidebarLayout>
  );
} 