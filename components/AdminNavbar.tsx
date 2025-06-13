"use client"
import { usePathname, useRouter } from "next/navigation"
import { Menu as MenuIcon, LogOut, User } from "lucide-react"
import React, { useState, useEffect } from "react"
import { getCurrentUser, signOut, UserProfile } from "@/lib/auth"

// 관리자 네비게이션 링크 목록
const navLinks = [
  { href: "/admin/participants", label: "투어 현황표" },
  { href: "/admin/tours", label: "투어 스케쥴 관리" },
  { href: "/admin/documents", label: "문서 관리" },
  { href: "/admin/quotes", label: "견적서 관리" },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push("/login");
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "관리자";
      case "manager":
        return "매니저";
      case "staff":
        return "스탭";
      default:
        return "직원";
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* 브랜드명/로고 */}
        <a href="/admin" className="text-xl font-bold tracking-tight flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-700" aria-label="관리자 홈">
          <span>싱싱골프투어</span>
        </a>
        
        {/* 데스크탑 메뉴 */}
        <ul className="hidden md:flex flex-row gap-2 ml-8 flex-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`px-4 py-2 rounded font-medium transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                  pathname === link.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
                aria-current={pathname === link.href ? "page" : undefined}
                tabIndex={0}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* 사용자 메뉴 (데스크탑) */}
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                <User className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500">
                    {getRoleName(user.role)}
                    {user.is_active === false && " (비활성)"}
                  </p>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">{getRoleName(user.role)}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 모바일 메뉴 */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
            aria-label="메뉴 열기"
          >
            <MenuIcon className="h-6 w-6 text-gray-700" />
          </button>
          {isMenuOpen && (
            <div className="absolute left-0 right-0 top-16 bg-white shadow-md border-t z-50">
              <ul className="flex flex-col p-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`block px-4 py-2 rounded font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-blue-50"
                      }`}
                      tabIndex={0}
                      aria-label={link.label}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li className="border-t mt-2 pt-2">
                  {user && (
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-gray-700">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500">{getRoleName(user.role)}</p>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
