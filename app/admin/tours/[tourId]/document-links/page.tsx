'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Copy, ExternalLink, Trash2, Plus, X, Edit2, Palette, Share2, QrCode, Info, MessageCircle, Mail, Smartphone, Search, Filter, LayoutGrid, List, Clock, Eye } from 'lucide-react';

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
  const [isEditPortalModalOpen, setIsEditPortalModalOpen] = useState(false);
  const [editingPortalLink, setEditingPortalLink] = useState<DocumentLink | null>(null);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [portalTheme, setPortalTheme] = useState('blue');
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [enableThemeSelector, setEnableThemeSelector] = useState(true);
  const [managerPhone, setManagerPhone] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [targetAudience, setTargetAudience] = useState<'customer' | 'staff' | 'golf'>('customer');
  const [showOnlyDriver, setShowOnlyDriver] = useState(false);
  const [specialNotice, setSpecialNotice] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingLink, setSharingLink] = useState<DocumentLink | null>(null);
  
  // UI/UX 개선을 위한 상태
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'created' | 'views' | 'type'>('created');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  
  // 새 문서 링크 폼 상태
  const [newDocumentType, setNewDocumentType] = useState('customer_all');
  const [expirationDays, setExpirationDays] = useState('');
  
  // 수정 폼 상태
  const [editDocumentType, setEditDocumentType] = useState('');
  const [editExpirationDays, setEditExpirationDays] = useState('');
  
  // 포털 수정 상태
  const [editPortalTheme, setEditPortalTheme] = useState('blue');
  const [editShowContactInfo, setEditShowContactInfo] = useState(true);
  const [editEnableThemeSelector, setEditEnableThemeSelector] = useState(true);
  const [editManagerPhone, setEditManagerPhone] = useState('');
  const [editDriverPhone, setEditDriverPhone] = useState('');
  const [editTargetAudience, setEditTargetAudience] = useState<'customer' | 'staff' | 'golf'>('customer');
  const [editShowOnlyDriver, setEditShowOnlyDriver] = useState(false);
  const [editSpecialNotice, setEditSpecialNotice] = useState('');
  
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
    { value: 'portal', label: '통합 표지 (포털)', icon: '🎯', category: 'special' },
    { value: 'customer_all', label: '고객용 통합 문서 (추천)', icon: '📚', category: 'customer' },
    { value: 'staff_all', label: '스탭용 통합 문서 (추천)', icon: '📋', category: 'staff' },
    { value: 'golf_timetable', label: '골프장 전용 티타임표', icon: '⛳', category: 'golf' },
    // 기존 개별 문서 타입들 (호환성 유지)
    { value: 'customer_schedule', label: '고객용 일정표 (개별)', icon: '📅', category: 'customer' },
    { value: 'staff_schedule', label: '스탭용 일정표 (개별)', icon: '📅', category: 'staff' },
    { value: 'customer_boarding', label: '고객용 탑승안내 (개별)', icon: '🚌', category: 'customer' },
    { value: 'staff_boarding', label: '스탭용 탑승안내 (개별)', icon: '🚌', category: 'staff' },
    { value: 'room_assignment', label: '고객용 객실배정 (개별)', icon: '🏨', category: 'customer' },
    { value: 'room_assignment_staff', label: '스탭용 객실배정 (개별)', icon: '🏨', category: 'staff' },
    { value: 'customer_timetable', label: '고객용 티타임표 (개별)', icon: '⏰', category: 'customer' },
    { value: 'staff_timetable', label: '스탭용 티타임표 (개별)', icon: '⏰', category: 'staff' },
    { value: 'simplified', label: '간편일정', icon: '📄', category: 'customer' },
  ];
  
  // 필터 카테고리 정의
  const filterCategories = [
    { value: 'all', label: '전체' },
    { value: 'special', label: '특별' },
    { value: 'customer', label: '고객용' },
    { value: 'staff', label: '스탭용' },
    { value: 'golf', label: '골프장' },
  ];

  useEffect(() => {
    fetchData();
    // 투어 정보에서 연락처 가져오기
    fetchTourContacts();
  }, [tourId]);
  
  const fetchTourContacts = async () => {
    try {
      console.log('Fetching tour contacts for tourId:', tourId);
      
      // 투어 스탭 정보에서 매니저와 기사 연락처 가져오기
      const { data: staffData, error: staffError } = await supabase
        .from('singsing_tour_staff')
        .select('*')
        .eq('tour_id', tourId)
        .order('order');
        
      console.log('Staff data:', staffData);
      
      let resultManagerPhone = '';
      let resultDriverPhone = '';
      
      if (!staffError && staffData && staffData.length > 0) {
        // 매니저 찾기 (role이 '매니저' 또는 'manager' 또는 '가이드' 또는 'guide'인 스탭)
        const manager = staffData.find(staff => 
          staff.role === '매니저' || 
          staff.role === 'manager' ||
          staff.role === '가이드' ||
          staff.role === 'guide'
        );
        
        // 기사 찾기 (role이 '기사' 또는 'driver'인 스탭)
        const driver = staffData.find(staff => 
          staff.role === '기사' || 
          staff.role === 'driver'
        );
        
        console.log('Found manager:', manager);
        console.log('Found driver:', driver);
        
        if (manager && manager.phone) {
          resultManagerPhone = manager.phone;
          setManagerPhone(manager.phone);
        }
        
        if (driver && driver.phone) {
          resultDriverPhone = driver.phone;
          setDriverPhone(driver.phone);
        }
      }
      
      // 투어 정보에서도 확인 (폴백)
      if (!resultManagerPhone || !resultDriverPhone) {
        const { data: tourData, error: tourError } = await supabase
          .from('singsing_tours')
          .select('*')
          .eq('id', tourId)
          .single();
          
        console.log('Tour data:', tourData);
          
        if (!tourError && tourData) {
          if (!resultManagerPhone && tourData.manager_phone) {
            resultManagerPhone = tourData.manager_phone;
            setManagerPhone(tourData.manager_phone);
          }
          if (!resultDriverPhone && tourData.driver_phone) {
            resultDriverPhone = tourData.driver_phone;
            setDriverPhone(tourData.driver_phone);
          }
        }
      }
      
      console.log('Final contacts:', { managerPhone: resultManagerPhone, driverPhone: resultDriverPhone });
      
      return {
        managerPhone: resultManagerPhone,
        driverPhone: resultDriverPhone
      };
    } catch (error) {
      console.error('Error fetching tour contacts:', error);
      return {
        managerPhone: '',
        driverPhone: ''
      };
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
  
  const shareViaKakao = (link: DocumentLink) => {
    const url = getDocumentUrl(link);
    const documentType = documentTypeOptions.find(opt => opt.value === link.document_type);
    const title = `${tour?.title} - ${documentType?.label || '문서'}`;
    const text = `[싱싱골프투어]\n${title}\n\n투어 문서를 확인하세요!\n${url}`;
    
    // 카카오 SDK가 로드되었는지 확인
    if (typeof window !== 'undefined' && window.Kakao?.Share) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: title,
            description: '싱싱골프투어 문서를 확인하세요',
            imageUrl: 'https://go.singsinggolf.kr/logo.png',
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
          buttons: [
            {
              title: '문서 보기',
              link: {
                mobileWebUrl: url,
                webUrl: url,
              },
            },
          ],
        });
        return;
      } catch (error) {
        console.error('Kakao SDK error:', error);
      }
    }
    
    // SDK가 없는 경우 폴백: 복사 후 카카오톡 앱 열기
    navigator.clipboard.writeText(text);
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // 카카오톡 앱 열기 시도
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // iOS는 카카오톡 URL 스킴을 통해 앱 열기
        window.location.href = 'kakaotalk://msg/text/' + encodeURIComponent(text);
      } else {
        // Android는 intent 사용
        window.location.href = 'intent://send?text=' + encodeURIComponent(text) + '#Intent;scheme=kakao;package=com.kakao.talk;end';
      }
      
      setTimeout(() => {
        alert('링크가 복사되었습니다.\n\n카카오톡이 열리지 않으면 카카오톡 앱에서 붙여넣기 해주세요.');
      }, 1000);
    } else {
      alert('링크가 복사되었습니다.\n카카오톡에서 붙여넣기 해주세요.');
    }
  };
  
  const shareViaSMS = (link: DocumentLink) => {
    const url = getDocumentUrl(link);
    const documentType = documentTypeOptions.find(opt => opt.value === link.document_type);
    const title = `${tour?.title} - ${documentType?.label || '문서'}`;
    const message = `${title}\n${url}`;
    
    // iOS와 Android 구분
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      // iOS는 &body= 사용
      window.location.href = `sms:&body=${encodeURIComponent(message)}`;
    } else if (isAndroid) {
      // Android는 ?body= 사용
      window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    } else {
      // 데스크톱인 경우 복사
      navigator.clipboard.writeText(message);
      alert('링크가 복사되었습니다.');
    }
  };
  
  const shareViaEmail = (link: DocumentLink) => {
    const url = getDocumentUrl(link);
    const documentType = documentTypeOptions.find(opt => opt.value === link.document_type);
    const subject = `${tour?.title} - ${documentType?.label || '문서'}`;
    const body = `안녕하세요,\n\n${tour?.title} 투어 문서를 공유합니다.\n\n${url}\n\n감사합니다.\n싱싱골프투어`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const shareNative = async (link: DocumentLink) => {
    const url = getDocumentUrl(link);
    const documentType = documentTypeOptions.find(opt => opt.value === link.document_type);
    const title = `${tour?.title} - ${documentType?.label || '문서'}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: '싱싱골프투어 문서를 확인하세요',
          url: url
        });
      } catch (err) {
        console.log('공유 취소 또는 오류:', err);
      }
    } else {
      // Web Share API를 지원하지 않는 경우 공유 모달 표시
      setSharingLink(link);
      setShowShareModal(true);
    }
  };
  
  const handleShare = (link: DocumentLink) => {
    // 모바일이면 네이티브 공유, 데스크톱이면 모달
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      shareNative(link);
    } else {
      setSharingLink(link);
      setShowShareModal(true);
    }
  };
  
  const handleEditClick = async (link: DocumentLink) => {
    if (link.document_type === 'portal') {
      // 포털 수정
      setEditingPortalLink(link);
      const settings = link.settings || {};
      setEditPortalTheme(settings.theme || 'blue');
      setEditShowContactInfo(settings.showContact !== false);
      setEditEnableThemeSelector(settings.enableThemeSelector !== false);
      setEditTargetAudience(settings.targetAudience || 'customer');
      setEditSpecialNotice(settings.specialNotice || '');
      
      // 항상 DB에서 최신 연락처 정보 불러오기
      const contacts = await fetchTourContacts();
      
      // 연락처 설정 - DB 값을 우선으로, 없으면 기존 settings 값 사용
      if (settings.contactNumbers) {
        // DB에서 값이 있으면 DB 값 사용, 없으면 기존 settings 값 사용
        setEditManagerPhone(contacts.managerPhone || settings.contactNumbers.manager || '');
        setEditDriverPhone(contacts.driverPhone || settings.contactNumbers.driver || '');
        
        // showOnlyDriver는 settings 값 유지 (사용자가 설정한 값)
        setEditShowOnlyDriver(!settings.contactNumbers.manager && !!settings.contactNumbers.driver);
      } else {
        // settings가 없으면 DB 값만 사용
        setEditManagerPhone(contacts.managerPhone);
        setEditDriverPhone(contacts.driverPhone);
        setEditShowOnlyDriver(false);
      }
      
      console.log('Edit portal - loaded contacts:', {
        managerPhone: contacts.managerPhone,
        driverPhone: contacts.driverPhone,
        editManagerPhone: editManagerPhone,
        editDriverPhone: editDriverPhone
      });
      
      setIsEditPortalModalOpen(true);
    } else {
      // 일반 문서 수정
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
    }
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
        targetAudience: targetAudience,
        specialNotice: specialNotice
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
  
  const handleUpdatePortal = async () => {
    if (!editingPortalLink) return;
    
    try {
      const portalSettings = {
        theme: editPortalTheme,
        showContact: editShowContactInfo,
        enableThemeSelector: editEnableThemeSelector,
        contactNumbers: {
          manager: editShowOnlyDriver ? '' : editManagerPhone,
          driver: editDriverPhone
        },
        targetAudience: editTargetAudience,
        specialNotice: editSpecialNotice
      };

      const { error } = await supabase
        .from('public_document_links')
        .update({
          settings: portalSettings
        })
        .eq('id', editingPortalLink.id);

      if (error) throw error;

      setDocumentLinks(documentLinks.map(link => 
        link.id === editingPortalLink.id 
          ? { ...link, settings: portalSettings }
          : link
      ));
      
      setIsEditPortalModalOpen(false);
      setEditingPortalLink(null);
      alert('통합 표지가 수정되었습니다.');
    } catch (error) {
      console.error('Error updating portal:', error);
      alert('통합 표지 수정 중 오류가 발생했습니다.');
    }
  };
  
  const getDocumentUrl = (link: DocumentLink) => {
    // document_type에 따라 다른 경로 사용
    let prefix = 's';
    if (link.document_type === 'quote') prefix = 'q';
    else if (link.document_type === 'portal') prefix = 'portal';
    return `${window.location.origin}/${prefix}/${link.public_url}`;
  };
  
  // 필터링된 문서 링크 가져오기
  const getFilteredLinks = () => {
    let filtered = [...documentLinks];
    
    // 활성 상태 필터
    if (showOnlyActive) {
      filtered = filtered.filter(link => link.is_active);
    }
    
    // 검색어 필터
    if (searchQuery) {
      filtered = filtered.filter(link => {
        const docType = documentTypeOptions.find(opt => opt.value === link.document_type);
        const label = docType?.label || link.document_type;
        return label.toLowerCase().includes(searchQuery.toLowerCase()) ||
               link.public_url.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // 카테고리 필터
    if (filterType !== 'all') {
      filtered = filtered.filter(link => {
        const docType = documentTypeOptions.find(opt => opt.value === link.document_type);
        return docType?.category === filterType;
      });
    }
    
    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'type':
          return a.document_type.localeCompare(b.document_type);
        case 'created':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    return filtered;
  };
  
  const filteredLinks = getFilteredLinks();

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">문서 링크 관리</h1>
        <p className="text-gray-600">
          {tour?.title} ({new Date(tour?.start_date || '').toLocaleDateString('ko-KR')} ~ 
          {new Date(tour?.end_date || '').toLocaleDateString('ko-KR')})
        </p>
      </div>

      {/* 상단 컨트롤 영역 */}
      <div className="mb-6 space-y-4">
        {/* 버튼 그룹 */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={async () => {
              // 통합 표지 생성 모달을 열기 전에 연락처 다시 불러오기
              const contacts = await fetchTourContacts();
              setManagerPhone(contacts.managerPhone);
              setDriverPhone(contacts.driverPhone);
              setIsPortalModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            통합 표지 만들기
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 문서 링크 생성
          </button>
        </div>
        
        {/* 검색 및 필터 영역 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 검색바 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="문서 이름 또는 URL로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 필터 및 컨트롤 */}
          <div className="flex gap-2">
            {/* 카테고리 필터 */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterCategories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            
            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'created' | 'views' | 'type')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created">최신순</option>
              <option value="views">조회순</option>
              <option value="type">유형순</option>
            </select>
            
            {/* 활성 상태 토글 */}
            <button
              onClick={() => setShowOnlyActive(!showOnlyActive)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showOnlyActive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              {showOnlyActive ? '활성만' : '전체'}
            </button>
            
            {/* 뷰 모드 전환 */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition-colors border-l border-gray-300 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 현재 필터 상태 */}
        {(searchQuery || filterType !== 'all' || !showOnlyActive) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>필터링 결과:</span>
            <span className="font-medium">{filteredLinks.length}개</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setShowOnlyActive(true);
              }}
              className="ml-2 text-blue-600 hover:text-blue-700"
            >
              초기화
            </button>
          </div>
        )}
      </div>

      {documentLinks.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded-lg">
          <p>아직 생성된 문서 링크가 없습니다.</p>
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
                        {link.document_type === 'portal' && (
                          <>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              특별
                            </span>
                            {link.settings?.targetAudience && link.settings.targetAudience !== 'customer' && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                link.settings.targetAudience === 'staff' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {link.settings.targetAudience === 'staff' ? '💼 스탭용' : '⛳ 골프장용'}
                              </span>
                            )}
                          </>
                        )}
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
                        <p className="text-xs text-blue-600 ml-8">
                          {(() => {
                            const audience = link.settings?.targetAudience || 'customer';
                            const audienceMap: Record<string, string> = {
                              customer: '👥 고객님을 위한',
                              staff: '💼 스탭을 위한',
                              golf: '⛳ 골프장을 위한'
                            };
                            return `${audienceMap[audience]} 시각적인 통합 안내 페이지`;
                          })()}
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
                      <button
                        onClick={() => handleShare(link)}
                        className="p-2 border rounded-md hover:bg-gray-50 transition-colors"
                        title="공유하기"
                      >
                        <Share2 className="w-4 h-4" />
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
                  {/* 중요 문서 */}
                  <optgroup label="───── 추천 문서 ─────">
                    {documentTypeOptions.filter(opt => ['portal', 'customer_all', 'staff_all', 'golf_timetable'].includes(opt.value)).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </optgroup>
                  {/* 개별 문서 */}
                  <optgroup label="───── 개별 문서 ─────">
                    {documentTypeOptions.filter(opt => !['portal', 'customer_all', 'staff_all', 'golf_timetable'].includes(opt.value)).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
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
                  {/* 중요 문서 */}
                  <optgroup label="───── 추천 문서 ─────">
                    {documentTypeOptions.filter(opt => ['portal', 'customer_all', 'staff_all', 'golf_timetable'].includes(opt.value)).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </optgroup>
                  {/* 개별 문서 */}
                  <optgroup label="───── 개별 문서 ─────">
                    {documentTypeOptions.filter(opt => !['portal', 'customer_all', 'staff_all', 'golf_timetable'].includes(opt.value)).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
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
              <h2 className="text-xl font-semibold">통합 표지 생성</h2>
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
                {editTargetAudience === 'staff' ? '스탭이' : editTargetAudience === 'golf' ? '골프장에서' : '고객님의'} 핸드폰에서 투어 문서를 쉽게 볼 수 있도록 만든 특별한 페이지입니다.
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
                  대상 선택
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
                  테마 색상
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
                <h3 className="text-sm font-medium text-gray-700">표시 옵션</h3>
                
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
                  <h3 className="text-sm font-medium text-gray-700">비상연락처 정보</h3>
                  
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
                        {managerPhone && (
                          <p className="text-xs text-gray-500 mt-1">투어 스탭에서 자동 불러옴</p>
                        )}
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
                      {driverPhone && (
                        <p className="text-xs text-gray-500 mt-1">투어 스탭에서 자동 불러옴</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 특별공지사항 입력 */}
              <div className="space-y-2">
                <label htmlFor="special-notice" className="block text-sm font-medium text-gray-700">
                  특별공지사항 (선택)
                </label>
                <textarea
                  id="special-notice"
                  value={specialNotice}
                  onChange={(e) => setSpecialNotice(e.target.value)}
                  placeholder="투어 관련 특별한 안내사항이 있다면 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">
                  예: 호텔 체크인 시간 변경, 골프장 드레스 코드, 특별 준비물 등
                </p>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                통합 표지 생성하기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 통합 표지 수정 모달 */}
      {isEditPortalModalOpen && editingPortalLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">통합 표지 수정</h2>
              <button
                onClick={() => setIsEditPortalModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 대상 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  대상 선택
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditTargetAudience('customer')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      editTargetAudience === 'customer'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">고객용</div>
                    <div className="text-xs text-gray-600 mt-1">고객님에게 보여줄 문서만</div>
                  </button>
                  <button
                    onClick={() => setEditTargetAudience('staff')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      editTargetAudience === 'staff'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">스탭용</div>
                    <div className="text-xs text-gray-600 mt-1">스탭 전용 문서만</div>
                  </button>
                  <button
                    onClick={() => setEditTargetAudience('golf')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      editTargetAudience === 'golf'
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
                  테마 색상
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
                      onClick={() => setEditPortalTheme(theme.value)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                        editPortalTheme === theme.value
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
                <h3 className="text-sm font-medium text-gray-700">표시 옵션</h3>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editShowContactInfo}
                    onChange={(e) => {
                      setEditShowContactInfo(e.target.checked);
                      if (!e.target.checked) {
                        setEditShowOnlyDriver(false);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    비상연락처 섹션 표시
                  </span>
                </label>
                
                {editShowContactInfo && (
                  <label className="flex items-center gap-3 ml-7">
                    <input
                      type="checkbox"
                      checked={editShowOnlyDriver}
                      onChange={(e) => setEditShowOnlyDriver(e.target.checked)}
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
                    checked={editEnableThemeSelector}
                    onChange={(e) => setEditEnableThemeSelector(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    고객이 테마를 변경할 수 있도록 허용
                  </span>
                </label>
              </div>
              
              {/* 연락처 입력 */}
              {editShowContactInfo && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700">비상연락처 정보</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {!editShowOnlyDriver && (
                      <div>
                        <label htmlFor="edit-manager-phone" className="block text-sm text-gray-600 mb-1">
                          담당 매니저 연락처
                        </label>
                        <input
                          id="edit-manager-phone"
                          type="tel"
                          value={editManagerPhone}
                          onChange={(e) => setEditManagerPhone(e.target.value)}
                          placeholder="연락처 입력"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    <div className={editShowOnlyDriver ? 'col-span-2' : ''}>
                      <label htmlFor="edit-driver-phone" className="block text-sm text-gray-600 mb-1">
                        기사님 연락처
                      </label>
                      <input
                        id="edit-driver-phone"
                        type="tel"
                        value={editDriverPhone}
                        onChange={(e) => setEditDriverPhone(e.target.value)}
                        placeholder="연락처 입력"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* 특별공지사항 입력 */}
              <div className="space-y-2">
                <label htmlFor="edit-special-notice" className="block text-sm font-medium text-gray-700">
                  특별공지사항 (선택)
                </label>
                <textarea
                  id="edit-special-notice"
                  value={editSpecialNotice}
                  onChange={(e) => setEditSpecialNotice(e.target.value)}
                  placeholder="투어 관련 특별한 안내사항이 있다면 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">
                  예: 호텔 체크인 시간 변경, 골프장 드레스 코드, 특별 준비물 등
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setIsEditPortalModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdatePortal}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                통합 표지 수정하기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 공유 모달 */}
      {showShareModal && sharingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">문서 공유하기</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 text-center">
              공유 방법을 선택하세요
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  shareViaKakao(sharingLink);
                  setShowShareModal(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">카카오톡으로 공유</span>
              </button>
              
              <button
                onClick={() => {
                  shareViaSMS(sharingLink);
                  setShowShareModal(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-300 rounded-lg transition-colors"
              >
                <Smartphone className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">문자로 공유</span>
              </button>
              
              <button
                onClick={() => {
                  shareViaEmail(sharingLink);
                  setShowShareModal(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">이메일로 공유</span>
              </button>
              
              <button
                onClick={() => {
                  copyToClipboard(getDocumentUrl(sharingLink));
                  setShowShareModal(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">링크 복사하기</span>
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                공유할 링크:
              </p>
              <p className="text-xs text-gray-600 break-all">
                {getDocumentUrl(sharingLink)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
