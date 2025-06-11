'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, Hotel, Clock, Bus, MapPin, Calendar, Phone, Menu, X, Palette, ChevronRight, Copy, ExternalLink, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';

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
  customer_all: { icon: '📚', label: '통합 문서', desc: '탭으로 전환 가능' }
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
  const [showAllDocumentFrame, setShowAllDocumentFrame] = useState(false);

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

  const theme = themes[currentTheme as keyof typeof themes];

  // 필수 문서와 추가 문서 분류
  const essentialDocs = ['simplified', 'customer_all', 'room_assignment', 'customer_timetable'];
  const essentialLinks = documentLinks.filter(link => essentialDocs.includes(link.document_type));
  const additionalLinks = documentLinks.filter(link => !essentialDocs.includes(link.document_type));

  return (
    <div className="min-h-screen bg-gray-50" style={{ 
      '--primary-color': theme.primary,
      '--secondary-color': theme.secondary,
      '--accent-color': theme.accent,
      '--light-color': theme.light
    } as React.CSSProperties}>
      {/* 헤더 */}
      <header 
        className="relative text-white text-center py-12 px-6 rounded-b-3xl shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` 
        }}
      >
        {/* 테마 선택기 */}
        {portalSettings.enableThemeSelector !== false && (
          <div className="absolute top-5 right-5">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm">테마</span>
            </button>
            
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50">
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
              const isAllDoc = link.document_type === 'customer_all';
              
              return (
                <div
                  key={link.id}
                  onClick={() => {
                    if (isAllDoc) {
                      setShowAllDocumentFrame(!showAllDocumentFrame);
                    } else {
                      window.open(getDocumentUrl(link), '_blank');
                    }
                  }}
                  className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    필수
                  </div>
                  <div className="text-3xl mb-3">{info?.icon || '📄'}</div>
                  <h3 className="font-medium text-gray-800 mb-1">{info?.label || link.document_type}</h3>
                  <p className="text-sm text-gray-600">{info?.desc}</p>
                  {isAllDoc && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-blue-600">클릭하여 미리보기</p>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        
        {/* 통합 문서 iframe */}
        {showAllDocumentFrame && essentialLinks.find(link => link.document_type === 'customer_all') && (
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">📚 통합 문서 미리보기</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={getDocumentUrl(essentialLinks.find(link => link.document_type === 'customer_all')!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <span>새 탭에서 열기</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setShowAllDocumentFrame(false)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  일정표, 탑승안내, 객실배정, 티타임표를 탭으로 전환하며 볼 수 있습니다.
                </p>
              </div>
              <iframe
                src={getDocumentUrl(essentialLinks.find(link => link.document_type === 'customer_all')!)}
                className="w-full h-[600px] border-0"
                title="통합 문서"
              />
            </div>
          </section>
        )}

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
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </a>
                    </li>
                  );
                })}
              </ul>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm opacity-90 mb-1">담당 매니저</div>
                  <a 
                    href={`tel:${portalSettings.contactNumbers?.manager || '010-1234-5678'}`}
                    className="text-lg font-semibold"
                  >
                    {portalSettings.contactNumbers?.manager || '010-1234-5678'}
                  </a>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm opacity-90 mb-1">기사님</div>
                  <a 
                    href={`tel:${portalSettings.contactNumbers?.driver || '010-5254-9876'}`}
                    className="text-lg font-semibold"
                  >
                    {portalSettings.contactNumbers?.driver || '010-5254-9876'}
                  </a>
                </div>
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
  );
}
