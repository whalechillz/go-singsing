"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Users, Lock, Mail, AlertCircle, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('로그인 시도:', email);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    try {
      // Supabase 인증
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('로그인 응답:', { data, authError });

      if (authError) {
        console.error('로그인 에러:', authError);
        setError(`로그인 실패: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (data.user) {
        // 사용자 정보 가져오기
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        // 역할에 따라 리다이렉트
        if (profileData?.role === "admin" || profileData?.role === "manager") {
          router.push("/admin");
        } else if (profileData?.role === "staff") {
          router.push("/");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">싱싱골프투어</h2>
            <p className="mt-2 text-sm text-gray-600">직원 로그인</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 로그인 폼 */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    로그인 중...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 추가 정보 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정 문제가 있으신가요?{" "}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                관리자에게 문의
              </a>
            </p>
          </div>
        </div>

        {/* 역할 안내 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">접근 권한 안내</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-20 font-medium text-gray-700">관리자</div>
              <div className="text-gray-600">모든 기능 접근 가능</div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-20 font-medium text-gray-700">매니저</div>
              <div className="text-gray-600">투어 관리, 고객 관리 가능</div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-20 font-medium text-gray-700">스탭</div>
              <div className="text-gray-600">투어 정보 조회 및 기본 업무</div>
            </div>
          </div>
        </div>

        {/* 테스트 계정 안내 (개발 중에만 표시) */}
        <div className="mt-4 bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">테스트 계정</h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-600">관리자:</span>
              <span className="text-gray-800">admin@singsinggolf.kr / admin123!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">매니저:</span>
              <span className="text-gray-800">manager@singsinggolf.kr / manager123!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">스탭:</span>
              <span className="text-gray-800">staff@singsinggolf.kr / staff123!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
