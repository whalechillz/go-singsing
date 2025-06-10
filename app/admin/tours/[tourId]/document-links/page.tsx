'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Copy, ExternalLink, Trash2, Plus, X, Edit2 } from 'lucide-react';

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
  
  // 새 문서 링크 폼 상태
  const [newDocumentType, setNewDocumentType] = useState('customer_schedule');
  const [expirationDays, setExpirationDays] = useState('');
  
  // 수정 폼 상태
  const [editDocumentType, setEditDocumentType] = useState('');
  const [editExpirationDays, setEditExpirationDays] = useState('');

  const documentTypeOptions = [
    { value: 'customer_schedule', label: '고객용 일정표' },
    { value: 'staff_schedule', label: '스탭용 일정표' },
    { value: 'customer_boarding', label: '고객용 탑승안내' },
    { value: 'staff_boarding', label: '스탭용 탑승안내' },
    { value: 'room_assignment', label: '고객용 객실배정' },
    { value: 'room_assignment_staff', label: '스탭용 객실배정' },
    { value: 'customer_timetable', label: '고객용 티타임표' },
    { value: 'staff_timetable', label: '스탭용 티타임표' },
    { value: 'simplified', label: '간편일정' },
  ];

  useEffect(() => {
    fetchData();
  }, [tourId]);

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
      setNewDocumentType('customer_schedule');
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

  const getDocumentUrl = (publicUrl: string) => {
    return `${window.location.origin}/s/${publicUrl}`;
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

      <div className="mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 문서 링크 생성
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
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">
                        {documentType?.label || link.document_type}
                      </h3>
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
                        value={getDocumentUrl(link.public_url)}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(getDocumentUrl(link.public_url))}
                        className="p-2 border rounded-md hover:bg-gray-50 transition-colors"
                        title="링크 복사"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(getDocumentUrl(link.public_url), '_blank')}
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
    </div>
  );
}
