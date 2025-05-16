"use client"
import { usePathname } from "next/navigation"
import { Menu as MenuIcon } from "lucide-react"
import React, { useState } from "react"

// 관리자 네비게이션 링크 목록
const navLinks = [
  { href: "/admin/participants", label: "투어 현황표" },
  { href: "/admin/tours", label: "투어 관리" },
  { href: "/admin/documents", label: "문서 관리" },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 relative">
        {/* 모바일 햄버거 */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          aria-label="메뉴 열기"
        >
          <MenuIcon className="h-5 w-5 text-gray-600" />
        </button>
        {/* 로고/타이틀 */}
        <a href="/admin" className="flex items-center gap-2 ml-2 md:ml-0" tabIndex={0} aria-label="관리자 홈">
          <span className="text-lg font-semibold">관리자</span>
        </a>
        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex gap-6 ml-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-2 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                pathname === link.href
                  ? "bg-blue-100 text-blue-700 font-bold underline"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              tabIndex={0}
              aria-label={link.label}
            >
              {link.label}
            </a>
          ))}
        </div>
        {/* 모바일 메뉴 (드로어 대신 드롭다운) */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-md z-50 border-t md:hidden">
            <div className="flex flex-col p-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    pathname === link.href
                      ? "bg-blue-100 text-blue-700 font-bold underline"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  tabIndex={0}
                  aria-label={link.label}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {/* 프로필/설정 등 우측 아이콘 필요시 여기에 추가 */}
        </div>
      </div>
    </nav>
  )
} 