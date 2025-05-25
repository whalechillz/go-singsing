import ModernAdminLayout from "@/components/admin/ModernAdminLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "싱싱골프투어 - 관리자",
  description: "싱싱골프투어 관리자 페이지",
};

export default function AdminRootLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <ModernAdminLayout>
      {children}
    </ModernAdminLayout>
  );
} 