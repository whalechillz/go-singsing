"use client"
import { usePathname } from "next/navigation"
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer"
import { Menu as MenuIcon } from "lucide-react"
import React from "react"

const menus = [
  { label: "참가자 관리", href: "/participants" },
  { label: "투어 관리", href: "/tours" },
  { label: "문서 관리", href: "/documents" },
]

const AdminNavbar: React.FC = () => {
  const pathname = usePathname()

  return (
    <nav className="w-full border-b bg-white sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        {/* 로고/타이틀 */}
        <div className="font-bold text-lg select-none" tabIndex={0} aria-label="관리자 홈">관리자</div>
        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex gap-6">
          {menus.map((menu) => (
            <a
              key={menu.href}
              href={menu.href}
              tabIndex={0}
              aria-label={menu.label}
              className={
                `px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary ` +
                (pathname.startsWith(menu.href)
                  ? "text-primary font-bold underline"
                  : "text-gray-700 hover:text-primary")
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  window.location.href = menu.href
                }
              }}
            >
              {menu.label}
            </a>
          ))}
        </div>
        {/* 모바일 햄버거 */}
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger aria-label="메뉴 열기" className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary">
              <MenuIcon className="w-6 h-6" />
            </DrawerTrigger>
            <DrawerContent>
              <div className="flex flex-col gap-4 p-4">
                {menus.map((menu) => (
                  <a
                    key={menu.href}
                    href={menu.href}
                    tabIndex={0}
                    aria-label={menu.label}
                    className={
                      `px-2 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary ` +
                      (pathname.startsWith(menu.href)
                        ? "text-primary font-bold underline"
                        : "text-gray-700 hover:text-primary")
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        window.location.href = menu.href
                      }
                    }}
                  >
                    {menu.label}
                  </a>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar 