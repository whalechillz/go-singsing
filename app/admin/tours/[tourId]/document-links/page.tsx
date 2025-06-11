'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Copy, ExternalLink, Trash2, Plus, X, Edit2, Palette, Share2, QrCode, Info } from 'lucide-react';

interface DocumentLink {
  id: string;
  tour_id: string;
  document_type: string;
  public_url: string;
  is_active: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
  first_viewed_at?: string | null;
  last_viewed_at?: string | null;
  settings?: any;
}

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

export default function DocumentLinksPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<DocumentLink | null>(null);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [portalTheme, setPortalTheme] = useState('blue');
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [enableThemeSelector, setEnableThemeSelector] = useState(true);
  const [managerPhone, setManagerPhone] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [targetAudience, setTargetAudience] = useState<'customer' | 'staff' | 'golf'>('customer');
  const [showOnlyDriver, setShowOnlyDriver] = useState(false);
  
  // 새 문서 링크 폼 상태
  const [newDocumentType, setNewDocumentType] = useState('customer_all');
  const [expirationDays, setExpirationDays] = useState('');
  
  // 수정 폼 상태
  const [editDocumentType, setEditDocumentType] = useState('');
  const [editExpirationDays, setEditExpirationDays] = useState('');
  
  // 테마 정의
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

  const documentTypeOptions = [
    { value: 'portal', label: '🎨 통합 표지 (포털)' },
    { value: 'customer_all', label: '✅ 고객용 통합 문서 (추천)' },
    { value: 'staff_all', label: '✅ 스탭용 통합 문서 (추천)' },
    { value: 'golf_timetable', label: '⛳ 골프장 전용 티타임표' },
    // 기존 개별 문서 타입들 (호환성 유지)
    { value: 'customer_schedule', label: '고객용 일정표 (개별)' },
    { value: 'staff_schedule', label: '스탭용 일정표 (개별)' },
    { value: 'customer_boarding', label: '고객용 탑승안내 (개별)' },
    { value: 'staff_boarding', label: '스탭용 탑승안내 (개별)' },
    { value: 'room_assignment', label: '고객용 객실배정 (개별)' },
    { value: 'room_assignment_staff', label: '스탭용 객실배정 (개별)' },
    { value: 'customer_timetable', label: '고객용 티타임표 (개별)' },
    { value: 'staff_timetable', label: '스탭용 티타임표 (개별)' },
    { value: 'simplified', label: '간편일정' },
  ];

  useEffect(() => {
    fetchData();
    // 투어 정보에서 연락처 가져오기
    fetchTourContacts();
  }, [tourId]);
  
  const fetchTourContacts = async () => {
    try {
      // 투어 정보에서 기본 연락처 가져오기
      const { data: tourData, error: tourError } = await supabase
        .from('singsing_tours')
        .select('*')
        .eq('id', tourId)
        .single();
        
      if (!tourError && tourData) {
        // 투어 정보에 연락처가 있다면 설정
        if (tourData.manager_phone) {
          setManagerPhone(tourData.manager_phone);
        }
        if (tourData.driver_phone) {
          setDriverPhone(tourData.driver_phone);
        }
      }
      
      // 아직 설정된 연락처가 없다면 기본값 사용
      if (!managerPhone) {
        setManagerPhone('010-1234-5678');
      }
      if (!driverPhone) {
        setDriverPhone('010-9876-5432');
      }
    } catch (error) {
      console.error('Error fetching tour contacts:', error);
    }
  };

  const fetchData = async () => {
    try {
      // 투어 정보 가져오기
      const { data: tourData, error: tourError } = await supabase
        .from('singsing_tours')
        .select('*')
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;
      setTour(tourData);

      // 문서 링크 목록 가져오기
      const { data: linksData, error: linksError } = await supabase
        .from('public_document_links')
        .select('*')
        .eq('tour_id', tourId)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;
      setDocumentLinks(linksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generatePublicUrl = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateLink = async () => {
    try {
      const expiresAt = expirationDays 
        ? new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('public_document_links')
        .insert({
          tour_id: tourId,
          document_type: newDocumentType,
          public_url: generatePublicUrl(),
          expires_at: expiresAt,
          is_active: true,
          view_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setDocumentLinks([data, ...documentLinks]);
      setIsCreateModalOpen(false);
      setNewDocumentType('customer_all');
      setExpirationDays('');
      alert('문서 링크가 생성되었습니다.');
    } catch (error) {
      console.error('Error creating link:', error);
      alert('문서 링크 생성 중 오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('public_document_links')
        .update({ is_active: !currentStatus })
        .eq('id', linkId);

      if (error) throw error;

      setDocumentLinks(documentLinks.map(link => 
        link.id === linkId ? { ...link, is_active: !currentStatus } : link
      ));
      
      alert(currentStatus ? '링크가 비활성화되었습니다.' : '링크가 활성화되었습니다.');
    } catch (error) {
      console.error('Error toggling link status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('정말로 이 링크를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('public_document_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setDocumentLinks(documentLinks.filter(link => link.id !== linkId));
      alert('문서 링크가 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('링크 삭제 중 오류가 발생했습니다.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('링크가 복사되었습니다.');
  };
  
  const handleEditClick = (link: DocumentLink) => {
    setEditingLink(link);
    setEditDocumentType(link.document_type);
    
    // 만료일 계산
    if (link.expires_at) {
      const expiresDate = new Date(link.expires_at);
      const today = new Date();
      const diffTime = expiresDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setEditExpirationDays(diffDays > 0 ? diffDays.toString() : '');
    } else {
      setEditExpirationDays('');
    }
    
    setIsEditModalOpen(true);
  };
  
  const handleUpdateLink = async () => {
    if (!editingLink) return;
    
    try {
      const expiresAt = editExpirationDays 
        ? new Date(Date.now() + parseInt(editExpirationDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('public_document_links')
        .update({
          document_type: editDocumentType,
          expires_at: expiresAt
        })
        .eq('id', editingLink.id);

      if (error) throw error;

      setDocumentLinks(documentLinks.map(link => 
        link.id === editingLink.id 
          ? { ...link, document_type: editDocumentType, expires_at: expiresAt }
          : link
      ));
      
      setIsEditModalOpen(false);
      setEditingLink(null);
      alert('문서 링크가 수정되었습니다.');
    } catch (error) {
      console.error('Error updating link:', error);
      alert('문서 링크 수정 중 오류가 발생했습니다.');
    }
  };
  
  const handleCreatePortal = async () => {
    try {
      const portalSettings = {
        theme: portalTheme,
        showContact: showContactInfo,
        enableThemeSelector: enableThemeSelector,
        contactNumbers: {
          manager: showOnlyDriver ? '' : managerPhone,
          driver: driverPhone
        },
        targetAudience: targetAudience
      };

      const { data, error } = await supabase
        .from('public_document_links')
        .insert({
          tour_id: tourId,
          document_type: 'portal',
          public_url: generatePublicUrl(),
          expires_at: null,
          is_active: true,
          view_count: 0,
          settings: portalSettings
        })
        .select()
        .single();

      if (error) throw error;

      setDocumentLinks([data, ...documentLinks]);
      setIsPortalModalOpen(false);
      alert('통합 표지가 생성되었습니다.');
    } catch (error) {
      console.error('Error creating portal:', error);
      alert('통합 표지 생성 중 오류가 발생했습니다.');
    }
  };

  const getDocumentUrl = (link: DocumentLink) => {
    // document_type에 따라 다른 경로 사용
    let prefix = 's';
    if (link.document_type === 'quote') prefix = 'q';
    else if (link.document_type === 'portal') prefix = 'portal';
    return `${window.location.origin}/${prefix}/${link.public_url}`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">문서 링크 관리</h1>
        <p className="text-gray-600">
          {tour?.title} ({new Date(tour?.start_date || '').toLocaleDateString('ko-KR')} ~ 
          {new Date(tour?.end_date || '').toLocaleDateString('ko-KR')})
        </p>
      </div>

      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setIsPortalModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Palette className="w-4 h-4 mr-2" />
          통합 표지 생성
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 문서 링크 생성
        </button>
        <button
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          title="QR코드 생성 (준비중)"
          disabled
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR코드 생성
        </button>
        <button
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          title="전체 링크 복사 (준비중)"
          disabled
        >
          <Share2 className="w-4 h-4 mr-2" />
          전체 링크 복사
        </button>
      </div>

      {documentLinks.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          아직 생성된 문서 링크가 없습니다. 위의 버튼을 클릭하여 새로운 링크를 생성하세요.
        </div>
      ) : (
        <div className="grid gap-4">
          {documentLinks.map((link) => {
            const documentType = documentTypeOptions.find(opt => opt.value === link.document_type);
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
            
            return (
              <div key={link.id} className={`bg-white rounded-lg shadow-sm border ${isExpired ? 'opacity-60' : ''}`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">
                          {documentType?.label || link.document_type}
                        </h3>
                      </div>
                      {link.document_type === 'customer_all' && (
                        <p className="text-xs text-gray-500 ml-8">
                          탭으로 문서 전환 가능 (일정표, 탑승안내, 객실배정, 티타임표, 간편일정)
                        </p>
                      )}
                      {link.document_type === 'staff_all' && (
                        <p className="text-xs text-gray-500 ml-8">
                          탭으로 문서 전환 가능 (일정표, 탑승안내, 객실배정, 티타임표)
                        </p>
                      )}
                      {link.document_type === 'golf_timetable' && (
                        <p className="text-xs text-orange-600 ml-8">
                          티타임표만 표시 - 골프장 공유용
                        </p>
                      )}
                      {link.document_type === 'portal' && (
                        <p className="text-xs text-purple-600 ml-8">
                          고객님을 위한 시각적인 통합 안내 페이지
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(link.id, link.is_active)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          link.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {link.is_active ? '활성' : '비활성'}
                      </button>
                      <button
                        onClick={() => handleEditClick(link)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={getDocumentUrl(link)}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(getDocumentUrl(link))}
                        className="p-2 border rounded-md hover:bg-gray-50 transition-colors"
                        title="링크 복사"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(getDocumentUrl(link), '_blank')}
                        className="p-2 border rounded-md hover:bg-gray-50 transition-colors"
                        title="새 탭에서 열기"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>조회수: {link.view_count}회</span>
                      <span>생성일: {new Date(link.created_at).toLocaleDateString('ko-KR')}</span>
                      {link.expires_at && (
                        <span className={isExpired ? 'text-red-600' : ''}>
                          만료일: {new Date(link.expires_at).toLocaleDateString('ko-KR')}
                          {isExpired && ' (만료됨)'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 모달 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">새 문서 링크 생성</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              공개적으로 접근 가능한 문서 링크를 생성합니다.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-1">
                  문서 종류
                </label>
                <select
                  id="document-type"
                  value={newDocumentType}
                  onChange={(e) => setNewDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
                  만료 기한 (일)
                </label>
                <input
                  id="expiration"
                  type="number"
                  placeholder="비워두면 무제한"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  링크가 자동으로 만료될 날짜를 설정합니다.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 수정 모달 */}
      {isEditModalOpen && editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">문서 링크 수정</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-document-type" className="block text-sm font-medium text-gray-700 mb-1">
                  문서 종류
                </label>
                <select
                  id="edit-document-type"
                  value={editDocumentType}
                  onChange={(e) => setEditDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-expiration" className="block text-sm font-medium text-gray-700 mb-1">
                  만료 기한 (일)
                </label>
                <input
                  id="edit-expiration"
                  type="number"
                  placeholder="비워두면 무제한"
                  value={editExpirationDays}
                  onChange={(e) => setEditExpirationDays(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  오늘부터 몇 일 후에 만료될지 설정합니다.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>주의:</strong> 링크 주소(URL)는 보안상 수정할 수 없습니다.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 통합 표지 생성 모달 */}
      {isPortalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🎨 통합 표지 생성</h2>
              <button
                onClick={() => setIsPortalModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                통합 표지란?
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                고객님의 핸드폰에서 투어 문서를 쉽게 볼 수 있도록 만든 특별한 페이지입니다.
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 복잡한 링크 대신 하나의 직관적인 페이지</li>
                <li>• 큰 아이콘과 글씨로 60대도 쉽게 사용</li>
                <li>• 터치 한 번에 문서 열기</li>
              </ul>
            </div>
            
            <div className="space-y-6">
              {/* 대상 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎯 대상 선택
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTargetAudience('customer')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      targetAudience === 'customer'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">고객용</div>
                    <div className="text-xs text-gray-600 mt-1">고객님에게 보여줄 문서만</div>
                  </button>
                  <button
                    onClick={() => setTargetAudience('staff')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      targetAudience === 'staff'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">스탭용</div>
                    <div className="text-xs text-gray-600 mt-1">스탭 전용 문서만</div>
                  </button>
                  <button
                    onClick={() => setTargetAudience('golf')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      targetAudience === 'golf'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">골프장용</div>
                    <div className="text-xs text-gray-600 mt-1">티타임표만</div>
                  </button>
                </div>
              </div>
              
              {/* 테마 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎨 테마 색상
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'blue', label: '클래식 블루', color: 'bg-blue-600' },
                    { value: 'purple', label: '엘레강트 퍼플', color: 'bg-purple-600' },
                    { value: 'green', label: '내추럴 그린', color: 'bg-green-600' },
                    { value: 'red', label: '다이나믹 레드', color: 'bg-red-600' },
                    { value: 'dark', label: '다크 모드', color: 'bg-gray-800' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setPortalTheme(theme.value)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                        portalTheme === theme.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${theme.color}`} />
                        <span className="text-sm font-medium">{theme.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 옵션 설정 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">⚙️ 표시 옵션</h3>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showContactInfo}
                    onChange={(e) => {
                      setShowContactInfo(e.target.checked);
                      if (!e.target.checked) {
                        setShowOnlyDriver(false);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    비상연락처 섹션 표시
                  </span>
                </label>
                
                {showContactInfo && (
                  <label className="flex items-center gap-3 ml-7">
                    <input
                      type="checkbox"
                      checked={showOnlyDriver}
                      onChange={(e) => setShowOnlyDriver(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      기사님 연락처만 표시
                    </span>
                  </label>
                )}
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={enableThemeSelector}
                    onChange={(e) => setEnableThemeSelector(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    고객이 테마를 변경할 수 있도록 허용
                  </span>
                </label>
              </div>
              
              {/* 연락처 입력 */}
              {showContactInfo && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700">📞 비상연락처 정보</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {!showOnlyDriver && (
                      <div>
                        <label htmlFor="manager-phone" className="block text-sm text-gray-600 mb-1">
                          담당 매니저 연락처
                        </label>
                        <input
                          id="manager-phone"
                          type="tel"
                          value={managerPhone}
                          onChange={(e) => setManagerPhone(e.target.value)}
                          placeholder="자동 불러오기 또는 직접 입력"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {managerPhone ? '투어 스탭에서 자동 불러옴' : '등록된 매니저 없음'}
                        </p>
                      </div>
                    )}
                    
                    <div className={showOnlyDriver ? 'col-span-2' : ''}>
                      <label htmlFor="driver-phone" className="block text-sm text-gray-600 mb-1">
                        기사님 연락처
                      </label>
                      <input
                        id="driver-phone"
                        type="tel"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="자동 불러오기 또는 직접 입력"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {driverPhone ? '투어 스탭에서 자동 불러옴' : '등록된 기사 없음'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 미리보기 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">✨ 생성될 통합 표지 미리보기</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• <strong>대상:</strong> {targetAudience === 'customer' ? '고객용' : targetAudience === 'staff' ? '스탭용' : '골프장용'} 문서만 표시</p>
                  {targetAudience === 'customer' && <p className="ml-4 text-xs">표시 문서: 간편일정, 통합문서, 객실배정, 티타임표</p>}
                  {targetAudience === 'staff' && <p className="ml-4 text-xs">표시 문서: 스탭용 통합, 객실배정, 티타임표</p>}
                  {targetAudience === 'golf' && <p className="ml-4 text-xs">표시 문서: 티타임표만</p>}
                  <p>• <strong>테마:</strong> {themes[portalTheme as keyof typeof themes].name}</p>
                  <p>• <strong>연락처:</strong> {showContactInfo ? (showOnlyDriver ? '기사님만' : '매니저 + 기사님') : '표시 안 함'}</p>
                  <p>• <strong>테마 변경:</strong> {enableThemeSelector ? '고객이 변경 가능' : '고정'}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 60대 고객님도 쉽게 사용할 수 있도록 크고 명확한 디자인
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setIsPortalModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreatePortal}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                통합 표지 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
