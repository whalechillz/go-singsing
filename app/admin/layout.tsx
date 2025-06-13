"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModernAdminLayout from "@/components/admin/ModernAdminLayout";
import { getCurrentUser } from "@/lib/auth";

export default function AdminRootLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        // 스탭과 고객은 접근 불가
        if (user.role === "staff" || user.role === "customer") {
          router.push("/");
          return;
        }

        // 비활성화된 사용자는 접근 불가
        if (user.is_active === false) {
          router.push("/login");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ModernAdminLayout>
      {children}
    </ModernAdminLayout>
  );
}
