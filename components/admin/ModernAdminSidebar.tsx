"use client"

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';
import Image from 'next/image';
import { 
  Home, 
  Briefcase, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart2, 
  Settings, 
  LogOut, 
  ChevronRight,
  ChevronDown,
  Menu,
  Palette,
  Package,
  UserCog,
  Shield,
  Phone,
  Calculator,
  Type
} from 'lucide-react';

interface NavSubItem {
  id: string;
  label: string;
  href: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  subMenu?: NavSubItem[];
}

interface ModernAdminSidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function ModernAdminSidebar({ isCollapsed, onCollapse }: ModernAdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({ 
    'participants-management': true, 
    'tour-management': true, 
    'memo-management': true,
    'tour-staff-management': true,
    'customer-management': true,
    'quote-management': true 
  });
  
  // pathname에 따라 activeNav 결정
  const getActiveNav = () => {
    if (pathname === '/admin') return 'dashboard';
    // 구체적인 경로를 먼저 체크
    if (pathname.includes('/room-assignment')) return 'room-assignment';
    if (pathname.includes('/tee-time')) return 'tee-time';
    if (pathname.startsWith('/admin/tours')) return 'tours';
    if (pathname.startsWith('/admin/tour-products')) return 'tour-products';
    if (pathname.startsWith('/admin/attractions')) return 'attractions';
    if (pathname.startsWith('/admin/participants')) return 'participants-list';
    if (pathname.startsWith('/admin/payments')) return 'payments';
    if (pathname.startsWith('/admin/documents')) return 'documents'; // 삭제됨
    if (pathname.startsWith('/admin/tour-documents')) return 'tour-documents';
    if (pathname.startsWith('/admin/memos')) return 'memos';
    if (pathname.startsWith('/admin/work-memos')) return 'work-memos';
    if (pathname.startsWith('/admin/memo-templates')) return 'memo-templates';
    if (pathname.startsWith('/admin/tour-staff')) return 'tour-staff';
    if (pathname.startsWith('/admin/staff')) return 'tour-staff'; // 기존 URL 호환성
    if (pathname.startsWith('/admin/users')) return 'users';
    if (pathname.startsWith('/admin/roles')) return 'roles';
    if (pathname.startsWith('/admin/password-reset')) return 'password-reset';
    if (pathname.startsWith('/admin/customers')) return 'customers';
    if (pathname.startsWith('/admin/messages')) return 'messages';
    if (pathname.startsWith('/admin/campaigns')) return 'campaigns';
    if (pathname.startsWith('/admin/promotions')) return 'promotions';
    if (pathname.startsWith('/admin/quotes')) return 'quotes';
    if (pathname.startsWith('/admin/color-test')) return 'color-test';
    if (pathname.startsWith('/admin/design-templates')) return 'design-templates';
    if (pathname.startsWith('/admin/font-styles')) return 'font-styles';
    if (pathname.startsWith('/admin/schedule-templates')) return 'schedule-templates';
    if (pathname.startsWith('/admin/statistics')) return 'statistics';
    if (pathname.startsWith('/admin/settings')) return 'settings';
    return 'dashboard';
  };
  
  const [activeNav, setActiveNav] = useState(getActiveNav());
  
  // pathname 변경 시 activeNav 업데이트
  useEffect(() => {
    setActiveNav(getActiveNav());
  }, [pathname]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: '대시보드', icon: <Home className="w-5 h-5" />, href: '/admin' },
    { 
      id: 'tour-management', 
      label: '투어 관리', 
      icon: <Briefcase className="w-5 h-5" />,
      subMenu: [
        { id: 'tours', label: '투어 스케줄 관리', href: '/admin/tours' },
        { id: 'tour-products', label: '여행상품 관리', href: '/admin/tour-products' },
        { id: 'attractions', label: '스팟 관리', href: '/admin/attractions' },
      ]
    },
    { 
      id: 'quote-management', 
      label: '견적 관리', 
      icon: <Calculator className="w-5 h-5" />,
      subMenu: [
        { id: 'quotes', label: '견적 목록', href: '/admin/quotes' },
        { id: 'quote-new', label: '새 견적 작성', href: '/admin/quotes/new' },
      ]
    },
    { 
      id: 'participants-management', 
      label: '전체 참가자 관리', 
      icon: <Users className="w-5 h-5" />,
      subMenu: [
        { id: 'participants-list', label: '참가자 목록', href: '/admin/participants' },
        { id: 'payments', label: '결제 관리', href: '/admin/payments' },
      ]
    },
    { 
      id: 'customer-management', 
      label: '고객 관리', 
      icon: <Phone className="w-5 h-5" />,
      subMenu: [
        { id: 'customers', label: '고객 데이터베이스', href: '/admin/customers' },
        { id: 'messages', label: '메시지 발송', href: '/admin/messages' },
        { id: 'campaigns', label: '마케팅 캠페인', href: '/admin/campaigns' },
        { id: 'promotions', label: '홍보 페이지', href: '/admin/promotions' },
      ]
    },
    { 
      id: 'tour-staff-management', 
      label: '투어 운영진', 
      icon: <UserCog className="w-5 h-5" />,
      subMenu: [
        { id: 'tour-staff', label: '기사/가이드 관리', href: '/admin/tour-staff' },
        { id: 'users', label: '시스템 계정', href: '/admin/users' },
        { id: 'roles', label: '권한 설정', href: '/admin/roles' },
        { id: 'password-reset', label: '비밀번호 초기화', href: '/admin/password-reset' },
      ]
    },
    // 문서 관리 기능은 더 이상 사용하지 않음 (투어 스케줄 관리 > 문서 미리보기로 대체)
    { 
      id: 'tour-documents', 
      label: '투어별 문서 링크', 
      icon: <FileText className="w-5 h-5" />,
      href: '/admin/tour-documents'
    },
    { 
      id: 'design-templates', 
      label: '디자인 템플릿', 
      icon: <Palette className="w-5 h-5" />,
      href: '/admin/design-templates'
    },
    { 
      id: 'font-styles', 
      label: '폰트 스타일', 
      icon: <Type className="w-5 h-5" />,
      href: '/admin/font-styles'
    },
    { 
      id: 'schedule-templates', 
      label: '일정표 템플릿', 
      icon: <FileText className="w-5 h-5" />,
      href: '/admin/schedule-templates'
    },
    { 
      id: 'memo-management', 
      label: '메모 관리', 
      icon: <MessageSquare className="w-5 h-5" />,
      subMenu: [
        { id: 'memos', label: '참가자 메모', href: '/admin/memos' },
        { id: 'work-memos', label: '업무 메모', href: '/admin/work-memos' },
        { id: 'memo-templates', label: '메모 템플릿', href: '/admin/memo-templates' },
      ]
    },
    { id: 'statistics', label: '통계', icon: <BarChart2 className="w-5 h-5" />, href: '/admin/statistics' },
    { id: 'settings', label: '설정', icon: <Settings className="w-5 h-5" />, href: '/admin/settings' },
  ];

  const handleNavClick = (item: NavItem | NavSubItem, parentId?: string) => {
    if ('subMenu' in item && item.subMenu) {
      if (isCollapsed) {
        // 접힌 상태에서는 첫 번째 서브메뉴로 바로 이동
        const firstSubMenu = item.subMenu[0];
        if (firstSubMenu && firstSubMenu.href) {
          setActiveNav(firstSubMenu.id);
          router.push(firstSubMenu.href);
        }
      } else {
        // 펼쳐진 상태에서는 서브메뉴 토글
        setOpenSubMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
      }
    } else if (item.href) {
      // href가 있는 경우 네비게이션
      setActiveNav(item.id);
      router.push(item.href);
    }
  };

  // 서브메뉴가 활성화되었을 때 부모 메뉴도 활성화 상태로 표시
  const isParentActive = (item: NavItem) => {
    if (!item.subMenu) return false;
    return item.subMenu.some(sub => sub.id === activeNav);
  };

  const handleLogout = async () => {
    try {
      console.log('로그아웃 시도 중...');
      const result = await signOut();
      console.log('로그아웃 결과:', result);
      
      if (result.success) {
        // 로컬 스토리지 및 세션 스토리지 클리어
        localStorage.clear();
        sessionStorage.clear();
        
        // 강제 리다이렉트
        window.location.href = '/login';
      } else {
        console.error('로그아웃 실패:', result.error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <aside 
      className={cn(
        "bg-blue-800 text-white transition-all duration-300 flex flex-col h-full",
        isCollapsed ? "w-20 overflow-visible" : "w-64 overflow-hidden"
      )}
    >
      {/* Sidebar header */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
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
        )}
        <button 
          className={cn(
            "p-2 rounded-md hover:bg-blue-700 focus:outline-none transition-colors",
            isCollapsed ? "mx-auto" : ""
          )}
          onClick={() => onCollapse(!isCollapsed)}
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-6 overflow-y-auto overflow-x-hidden">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              {item.subMenu ? (
                <>
                  <button
                    className={cn(
                      "w-full flex items-center py-3 px-4 hover:bg-blue-700 transition-colors touch-none relative group",
                      isParentActive(item) ? "bg-blue-900" : "",
                      isCollapsed ? "justify-center" : ""
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item);
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={cn(
                      "text-blue-200",
                      isParentActive(item) ? "text-white" : ""
                    )}>{item.icon}</span>
                    {/* 접힌 상태에서 활성화 표시 */}
                    {isCollapsed && isParentActive(item) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
                    )}
                    {/* 접힌 상태에서 툴팁 */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {item.label}
                      </div>
                    )}
                    {!isCollapsed && (
                      <>
                        <span className="ml-4">{item.label}</span>
                        {openSubMenus[item.id] ? (
                          <ChevronDown className="w-4 h-4 ml-auto text-blue-200" />
                        ) : (
                          <ChevronRight className="w-4 h-4 ml-auto text-blue-200" />
                        )}
                      </>
                    )}
                  </button>
                  {/* Submenu */}
                  {openSubMenus[item.id] && !isCollapsed && (
                    <ul className="ml-8">
                      {item.subMenu.map(sub => (
                        <li key={sub.id}>
                          <button
                            className={cn(
                              "w-full flex items-center py-3 px-4 hover:bg-blue-700 text-sm touch-none",
                              activeNav === sub.id ? "bg-blue-900" : ""
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNavClick(sub);
                            }}
                          >
                            <span>{sub.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  className={cn(
                    "w-full flex items-center py-3 px-4 hover:bg-blue-700 transition-colors touch-none relative group",
                    activeNav === item.id ? "bg-blue-900" : "",
                    isCollapsed ? "justify-center" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item);
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={cn(
                    "text-blue-200",
                    activeNav === item.id ? "text-white" : ""
                  )}>{item.icon}</span>
                  {/* 접힌 상태에서 활성화 표시 */}
                  {isCollapsed && activeNav === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
                  )}
                  {/* 접힌 상태에서 툴팁 */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.label}
                    </div>
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="ml-4">{item.label}</span>
                      {activeNav === item.id && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sidebar footer */}
      <div className="p-4 border-t border-blue-700 flex-shrink-0">
        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center text-blue-200 hover:text-white w-full relative group p-2 rounded-md hover:bg-blue-700 transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? '로그아웃' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-4">로그아웃</span>}
          {/* 접힌 상태에서 툴팁 */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              로그아웃
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}