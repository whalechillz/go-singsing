"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  BedDouble, 
  Calendar, 
  Flag, 
  Bus, 
  FileText,
  ChevronLeft,
  Home
} from 'lucide-react';

type TourNavigationProps = {
  tourId: string;
  tourTitle?: string;
};

const NAVIGATION_ITEMS = [
  { 
    path: "participants", 
    label: "참가자 관리", 
    icon: Users,
    description: "참가자 명단 및 그룹 관리"
  },
  { 
    path: "room-assignment", 
    label: "객실 배정", 
    icon: BedDouble,
    description: "호텔 객실 배정 관리"
  },
  { 
    path: "schedule", 
    label: "일정 관리", 
    icon: Calendar,
    description: "일차별 상세 일정 관리"
  },
  { 
    path: "tee-times", 
    label: "티오프 시간", 
    icon: Flag,
    description: "골프 티오프 시간 및 조 편성"
  },
  { 
    path: "boarding", 
    label: "탑승 스케줄", 
    icon: Bus,
    description: "버스 배정 및 탑승 관리"
  },
  { 
    path: "documents", 
    label: "문서 생성", 
    icon: FileText,
    description: "투어 관련 문서 생성 및 출력"
  },
];

export default function TourNavigation({ tourId, tourTitle }: TourNavigationProps) {
  const pathname = usePathname();
  const currentPath = pathname.split('/').pop();

  return (
    <div className="bg-white border-b">
      {/* 상단 네비게이션 바 */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/tours"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              투어 목록
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-semibold">{tourTitle || '투어 관리'}</h1>
          </div>
          <Link
            href={`/admin/tours/${tourId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            투어 대시보드
          </Link>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex overflow-x-auto">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <Link
              key={item.path}
              href={`/admin/tours/${tourId}/${item.path}`}
              className={`
                flex items-center gap-3 px-6 py-4 border-b-2 transition-all
                ${isActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 hidden sm:block">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// 레이아웃 래퍼 컴포넌트
export function TourManagementLayout({ 
  children, 
  tourId, 
  tourTitle 
}: { 
  children: React.ReactNode; 
  tourId: string; 
  tourTitle?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TourNavigation tourId={tourId} tourTitle={tourTitle} />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}