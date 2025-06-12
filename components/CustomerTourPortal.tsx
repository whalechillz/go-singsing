'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, Hotel, Clock, Bus, MapPin, Calendar, Phone, Menu, X, Palette, ChevronRight, Copy, ExternalLink, CheckCircle2, AlertCircle, UserPlus, Info, Share2 } from 'lucide-react';

interface TourData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  participant_count?: number;
  destination?: string;
}

interface DocumentLink {
  id: string;
  document_type: string;
  public_url: string;
  is_active: boolean;
}

interface PortalSettings {
  theme?: string;
  showContact?: boolean;
  showTourInfo?: boolean;
  enableThemeSelector?: boolean;
  contactNumbers?: {
    manager?: string;
    driver?: string;
  };
  targetAudience?: 'customer' | 'staff' | 'golf';
  specialNotice?: string;
}

interface CustomerTourPortalProps {
  tourData: TourData;
  documentLinks: DocumentLink[];
  portalSettings?: PortalSettings;
}

const themes = {
  blue: {
    name: '클래식 블루',
    primary: '#2c5282',
    secondary: '#3182ce',
    accent: '#4299e1',
    light: '#e7f3ff'
  },
  purple: {
    name: '엘레강트 퍼플',
    primary: '#6B46C1',
    secondary: '#7C3AED',
    accent: '#9333EA',
    light: '#f3e8ff'
  },
  green: {
    name: '내추럴 그린',
    primary: '#22543d',
    secondary: '#38a169',
    accent: '#48bb78',
    light: '#e6fffa'
  },
  red: {
    name: '다이나믹 레드',
    primary: '#c53030',
    secondary: '#e53e3e',
    accent: '#f56565',
    light: '#fff5f5'
  },
  dark: {
    name: '다크 모드',
    primary: '#1a202c',
    secondary: '#2d3748',
    accent: '#4a5568',
    light: '#2d3748'
  }
};

const documentTypeInfo: Record<string, { icon: string; label: string; desc?: string }> = {
  simplified: { icon: '📅', label: '간편일정', desc: '전체 일정 한눈에' },
  customer_schedule: { icon: '📋', label: '일정표', desc: '상세 일정 안내' },
  customer_boarding: { icon: '🚌', label: '탑승 안내', desc: '출발 시간 및 탑승 위치' },
  room_assignment: { icon: '🏨', label: '객실 배정표', desc: '숙소 배정 확인' },
  customer_timetable: { icon: '⛳', label: '티타임표', desc: '라운딩 시간' },
  customer_all: { icon: '📚', label: '통합 문서', desc: '탭으로 전환 가능' },
  staff_all: { icon: '💼', label: '스탭용 통합', desc: '스탭 전용 문서' },
  staff_schedule: { icon: '🗓️', label: '스탭 일정표', desc: '상세 운영 일정' },
  staff_boarding: { icon: '🚐', label: '스탭 탑승안내', desc: '운행 상세 정보' },
  room_assignment_staff: { icon: '🏪', label: '스탭 객실배정', desc: '스탭 숙소 배정' },
  staff_timetable: { icon: '🏆', label: '스탭 티타임표', desc: '상세 운영 정보' },
  golf_timetable: { icon: '🏌️', label: '골프장 티타임표', desc: '골프장 공유용' }
};

export default function CustomerTourPortal({ 
  tourData, 
  documentLinks, 
  portalSettings = {} 
}: CustomerTourPortalProps) {
  const [currentTheme, setCurrentTheme] = useState(portalSettings.theme || 'blue');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [daysInfo, setDaysInfo] = useState<{ type: 'before' | 'during' | 'after' | 'expired'; days: number } | null>(null);
  const [showMobileShare, setShowMobileShare] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [themeButtonColor, setThemeButtonColor] = useState(0);

  useEffect(() => {
    // 로컬 스토리지에서 테마 불러오기
    const savedTheme = localStorage.getItem('tourPortalTheme');
    if (savedTheme && themes[savedTheme as keyof typeof themes]) {
      setCurrentTheme(savedTheme);
    }
    
    // D-Day 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(tourData.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(tourData.end_date);
    endDate.setHours(0, 0, 0, 0);
    
    const startDiff = Math.floor((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const endDiff = Math.floor((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (today < startDate) {
      setDaysInfo({ type: 'before', days: startDiff });
    } else if (today >= startDate && today <= endDate) {
      setDaysInfo({ type: 'during', days: 0 });
    } else if (endDiff <= 7) {
      setDaysInfo({ type: 'after', days: endDiff });
    } else {
      setDaysInfo({ type: 'expired', days: endDiff });
    }
  }, [tourData]);
  
  // Pull-to-refresh 관련 이벤트
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(distance, 150));
        
        // 당긴 거리에 따라 테마 버튼 색상 변경
        const colorIndex = Math.floor((distance / 30) % 5);
        setThemeButtonColor(colorIndex);
      }
    };
    
    const handleTouchEnd = () => {
      if (isPulling && pullDistance > 80) {
        // 테마 버튼 반짝임 효과
        const colors = ['purple', 'blue', 'green', 'red', 'dark'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 테마 버튼에 반짝임 효과 주기
        setTimeout(() => {
          setThemeButtonColor(-1); // 특별한 반짝임 상태
        }, 100);
      }
      
      setIsPulling(false);
      setPullDistance(0);
      setThemeButtonColor(0);
    };
    
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance]);

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('tourPortalTheme', theme);
    setShowThemeMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDocumentUrl = (link: DocumentLink) => {
    const prefix = link.document_type === 'quote' ? 'q' : 's';
    return `${window.location.origin}/${prefix}/${link.public_url}`;
  };

  const copyToClipboard = (text: string, linkId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(linkId);
    setTimeout(() => setCopiedLink(null), 2000);
  };
  
  const sharePortal = async () => {
    const url = window.location.href;
    const title = `싱싱골프투어 - ${tourData.title}`;
    const text = `[싱싱골프투어]\n${tourData.title}\n\n투어 문서를 확인하세요!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url
        });
      } catch (err) {
        console.log('공유 취소 또는 오류:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('링크가 복사되었습니다.');
    }
  };

  const theme = themes[currentTheme as keyof typeof themes];

  // 대상에 따른 문서 필터링
  const targetAudience = portalSettings.targetAudience || 'customer';
  
  const getFilteredLinks = () => {
    if (targetAudience === 'customer') {
      // 고객용: 고객 관련 문서만
      return documentLinks.filter(link => 
        ['simplified', 'customer_all', 'customer_schedule', 'customer_boarding', 
         'room_assignment', 'customer_timetable'].includes(link.document_type)
      );
    } else if (targetAudience === 'staff') {
      // 스탭용: 스탭 관련 문서만
      return documentLinks.filter(link => 
        ['staff_all', 'staff_schedule', 'staff_boarding', 
         'room_assignment_staff', 'staff_timetable'].includes(link.document_type)
      );
    } else if (targetAudience === 'golf') {
      // 골프장용: 티타임표만
      return documentLinks.filter(link => 
        ['golf_timetable'].includes(link.document_type)
      );
    }
    return documentLinks;
  };
  
  const filteredLinks = getFilteredLinks();
  const essentialDocs = targetAudience === 'golf' 
    ? ['golf_timetable']
    : targetAudience === 'staff'
    ? ['staff_all', 'room_assignment_staff', 'staff_timetable']
    : ['simplified', 'customer_all', 'room_assignment', 'customer_timetable'];
  
  const essentialLinks = filteredLinks.filter(link => essentialDocs.includes(link.document_type));
  const additionalLinks = filteredLinks.filter(link => !essentialDocs.includes(link.document_type));

  return (
    <>
      <style jsx>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .rainbow-animation {
          background-size: 200% 200%;
          animation: rainbow 3s ease infinite;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50" style={{ 
        '--primary-color': theme.primary,
        '--secondary-color': theme.secondary,
        '--accent-color': theme.accent,
        '--light-color': theme.light
      } as React.CSSProperties}>
      {/* Pull-to-refresh indicator */}
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 flex items-center justify-center transition-all z-40"
          style={{ 
            height: `${pullDistance}px`,
            background: `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)`
          }}
        >
          <div className="text-center">
            <div 
              className="inline-block w-12 h-12 rounded-full animate-spin"
              style={{
                background: `conic-gradient(from 0deg, ${theme.primary}, ${theme.secondary}, ${theme.accent}, ${theme.primary})`
              }}
            />
            <p className="text-xs mt-2 text-gray-600">
              {pullDistance > 80 ? '🌈 놓으면 테마 버튼이 반짝여요!' : '아래로 당겨보세요...'}
            </p>
          </div>
        </div>
      )}
      {/* 헤더 */}
      <header 
        className="relative text-white text-center py-12 px-6 rounded-b-3xl shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` 
        }}
      >
        {/* 상단 버튼들 */}
        <div className="absolute top-5 left-5 right-5 flex justify-between">
          {/* 테마 선택기 (왼쪽) */}
          {portalSettings.enableThemeSelector !== false && (
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all transform ${
                  themeButtonColor === -1 
                    ? 'animate-pulse bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-white scale-110 shadow-2xl' 
                    : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
                }`}
                style={{
                  background: themeButtonColor > 0 && themeButtonColor !== -1
                    ? `linear-gradient(135deg, ${Object.values(themes)[themeButtonColor].primary} 0%, ${Object.values(themes)[themeButtonColor].secondary} 100%)`
                    : undefined
                }}
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm">테마</span>
              </button>
              
              {showThemeMenu && (
                <div className="absolute left-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50">
                  {Object.entries(themes).map(([key, themeData]) => (
                    <button
                      key={key}
                      onClick={() => changeTheme(key)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: themeData.primary }}
                      />
                      <span className="text-gray-700 text-sm">{themeData.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* 공유 버튼 (오른쪽) */}
          <button
            onClick={sharePortal}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-all transform hover:scale-110 group overflow-hidden shadow-lg hover:shadow-xl ml-auto"
            title="친구에게 공유하기 💝"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 opacity-80 group-hover:opacity-100 transition-opacity rainbow-animation" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-80 transition-opacity blur-sm rainbow-animation" />
            <Share2 className="relative w-4 h-4 text-white z-10" />
            <span className="relative text-sm text-white font-medium z-10">🎈 공유</span>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg">
              친구에게 공유 💝
            </span>
          </button>
        </div>
        
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4 drop-shadow-md">싱싱골프투어</h1>
          <h2 className="text-xl font-medium mb-2">{tourData.title}</h2>
          <p className="text-base opacity-90">
            {formatDate(tourData.start_date)} ~ {formatDate(tourData.end_date)}
          </p>
          
          {/* D-Day 표시 */}
          {daysInfo && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            {daysInfo.type === 'before' && (
            <>
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">D-{daysInfo.days}</span>
            </>
            )}
            {daysInfo.type === 'during' && (
            <>
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">진행중</span>
            </>
            )}
            {daysInfo.type === 'after' && (
            <>
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">종료 (D+{daysInfo.days})</span>
            </>
            )}
            {daysInfo.type === 'expired' && (
            <>
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">종료됨</span>
            </>
            )}
            </div>
          )}
          
          <div className="absolute bottom-3 right-6 text-xs opacity-70 text-right">
            수원시 영통구 법조로149번길 200<br/>
            TEL 031-215-3990
          </div>
        </div>
      </header>

      {/* 메인 섹션 */}
      <main className="container max-w-lg mx-auto px-5 py-8">
        {/* 투어 종료 후 안내 */}
        {daysInfo && daysInfo.type === 'expired' && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">투어가 종료되었습니다</h3>
                <p className="text-sm text-gray-600 mb-4">
                  이 투어는 {daysInfo.days}일 전에 종료되었습니다.
                  곧 이 페이지는 더 이상 접근할 수 없게 됩니다.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  회원가입하고 투어 기록 보관하기
                </a>
              </div>
            </div>
          </div>
        )}
        {/* 필수 문서 섹션 */}
        <section className="mb-8">
          <div className="flex items-center mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
              style={{ backgroundColor: theme.light }}
            >
              <FileText className="w-5 h-5" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: theme.primary }}>
              고객님을 위한 투어 문서
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {essentialLinks.map((link) => {
              const info = documentTypeInfo[link.document_type];
              
              return (
                <a
                  key={link.id}
                  href={getDocumentUrl(link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 relative overflow-hidden block no-underline"
                >
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    필수
                  </div>
                  <div className="text-3xl mb-3">{info?.icon || '📄'}</div>
                  <h3 className="font-medium text-gray-800 mb-1">{info?.label || link.document_type}</h3>
                  <p className="text-sm text-gray-600">{info?.desc}</p>
                  <div className="mt-2 flex items-center justify-center">
                    <span className="text-xs text-blue-600">터치하여 열기</span>
                    <ExternalLink className="w-3 h-3 text-blue-600 ml-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* 추가 문서 섹션 */}
        {additionalLinks.length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-5" style={{ color: theme.primary }}>
                📚 추가 안내 문서
              </h3>
              <ul className="space-y-3">
                {additionalLinks.map((link) => {
                  const info = documentTypeInfo[link.document_type];
                  return (
                    <li key={link.id}>
                      <a
                        href={getDocumentUrl(link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4 group-hover:shadow-md transition-shadow">
                          <span className="text-xl">{info?.icon || '📄'}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {info?.label || link.document_type}
                          </div>
                          {info?.desc && (
                            <div className="text-sm text-gray-600">{info.desc}</div>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* 특별공지사항 섹션 */}
        {portalSettings.specialNotice && (
          <section className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">📢 특별공지사항</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{portalSettings.specialNotice}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 비상 연락처 섹션 */}
        {portalSettings.showContact !== false && (
          <section className="mb-8">
            <div 
              className="rounded-2xl p-6 text-white text-center"
              style={{ 
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` 
              }}
            >
              <h3 className="text-lg font-medium mb-4 opacity-90">🚨 비상 연락처</h3>
              <div className={`grid ${portalSettings.contactNumbers?.manager ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {portalSettings.contactNumbers?.manager && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-sm opacity-90 mb-1">담당 매니저</div>
                    <a 
                      href={`tel:${portalSettings.contactNumbers.manager}`}
                      className="text-lg font-semibold"
                    >
                      {portalSettings.contactNumbers.manager}
                    </a>
                  </div>
                )}
                {portalSettings.contactNumbers?.driver && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-sm opacity-90 mb-1">기사님</div>
                    <a 
                      href={`tel:${portalSettings.contactNumbers.driver}`}
                      className="text-lg font-semibold"
                    >
                      {portalSettings.contactNumbers.driver}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 링크 공유 섹션 */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
              🔗 문서 링크 공유
            </h3>
            <div className="space-y-3">
              {documentLinks.slice(0, 3).map((link) => {
                const info = documentTypeInfo[link.document_type];
                return (
                  <div key={link.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={getDocumentUrl(link)}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(getDocumentUrl(link), link.id)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      title="링크 복사"
                    >
                      {copiedLink === link.id ? (
                        <span className="text-green-500 text-sm">✓</span>
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 하단 안내 */}
        <footer className="text-center py-6 text-gray-600 text-sm">
          <p className="mb-2">싱싱골프투어와 함께하는 즐거운 여행되세요! 🏌️‍♂️</p>
          <p>
            문의사항은{' '}
            <a href="tel:031-215-3990" className="font-medium" style={{ color: theme.primary }}>
              031-215-3990
            </a>
            으로 연락주세요.
          </p>
        </footer>
      </main>
    </div>
    </>
  );
}
