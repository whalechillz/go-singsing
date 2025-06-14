"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, UserProfile } from "@/lib/auth";

const StaffPortal = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const userData = await getCurrentUser();
      if (!userData || !['staff', 'manager', 'admin'].includes(userData.role)) {
        router.push('/login');
        return;
      }
      setUser(userData);
      
      // 기존 스탭 페이지로 리다이렉트
      window.location.href = '/admin';
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">스탭 페이지로 이동중...</p>
      </div>
    </div>
  );
};

export default StaffPortal;
