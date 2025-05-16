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
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* 브랜드명/로고 */}
        <a href="/admin" className="text-xl font-bold tracking-tight flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-700" aria-label="관리자 홈">
          <span>싱싱골프투어</span>
        </a>
        {/* 데스크탑 메뉴 */}
        <ul className="hidden md:flex gap-2 ml-8">
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
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
} 