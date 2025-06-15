"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
};

export type AppHeaderProps = {
  navItems: NavItem[];
  modeSwitch?: React.ReactNode;
  rightContent?: React.ReactNode;
};

const AppHeader: React.FC<AppHeaderProps> = ({ navItems, modeSwitch, rightContent }) => {
  return (
    <header className="w-full bg-blue-800 text-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* 브랜드명/로고 */}
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white" aria-label="홈으로 이동">
          <div className="relative h-8 w-auto">
            <Image
              src="/singsing_logo.svg"
              alt="싱싱골프투어 로고"
              width={150}
              height={32}
              className="h-8 w-auto object-contain filter brightness-0 invert"
              priority
            />
          </div>
        </Link>
        {/* 네비게이션 */}
        <ul className="hidden md:flex gap-2 ml-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`px-4 py-2 rounded font-medium transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-white ${item.active ? "bg-white text-blue-800" : "hover:bg-blue-700"}`}
                aria-current={item.active ? "page" : undefined}
                tabIndex={0}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* 모바일 네비게이션 (드롭다운/햄버거 등은 추후 확장 가능) */}
        <div className="md:hidden">
          {/* TODO: 모바일 메뉴 버튼/드로어 등 */}
        </div>
        {/* 우측 컨텐츠 (모드 전환, 사용자 등) */}
        <div className="flex items-center gap-2 ml-auto">
          {modeSwitch}
          {rightContent}
        </div>
      </nav>
    </header>
  );
};

export default AppHeader; 