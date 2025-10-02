"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit, Trash2, Send, Gift, Sparkles, Wand2 } from 'lucide-react';
import PremiumLetterPreview from '@/components/letters/PremiumLetterPreview';

interface GolfCourseContact {
  id: string;
  golf_course_name: string;
  contact_name: string;
  position?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GiftHistory {
  id: string;
  occasion: string;
  gift_type: string;
  gift_amount: number;
  quantity: number;
  sent_date: string;
  sent_by?: string;
  notes?: string;
  golf_course_contacts?: {
    golf_course_name: string;
    contact_name: string;
  };
}

export default function GolfContactsPage() {
  const [contacts, setContacts] = useState<GolfCourseContact[]>([]);
  const [giftHistory, setGiftHistory] = useState<GiftHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [editingContact, setEditingContact] = useState<GolfCourseContact | null>(null);
  const [selectedContact, setSelectedContact] = useState<GolfCourseContact | null>(null);
  const [form, setForm] = useState({
    golf_course_name: '',
    contact_name: '',
    position: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    notes: ''
  });
  const [giftForm, setGiftForm] = useState({
    occasion: '',
    gift_type: '스타벅스 카드',
    gift_amount: 30000,
    quantity: 5,
    sent_date: new Date().toISOString().split('T')[0],
    sent_by: '',
    notes: ''
  });
  const [letterForm, setLetterForm] = useState({
    template: '',
    custom_content: '',
    occasion: ''
  });
  const [aiImprovementRequest, setAiImprovementRequest] = useState('');
  const [isAiImproving, setIsAiImproving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [letterHistory, setLetterHistory] = useState<any[]>([]);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showOceanBeachModal, setShowOceanBeachModal] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchGiftHistory();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('golf_course_contacts')
        .select('*')
        .eq('is_active', true)
        .order('golf_course_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGiftHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_sending_history')
        .select(`
          *,
          golf_course_contacts!inner(golf_course_name, contact_name)
        `)
        .order('sent_date', { ascending: false });

      if (error) throw error;
      setGiftHistory(data || []);
    } catch (error) {
      console.error('Error fetching gift history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        const { error } = await supabase
          .from('golf_course_contacts')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingContact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('golf_course_contacts')
          .insert([form]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingContact(null);
      setForm({
        golf_course_name: '',
        contact_name: '',
        position: '',
        phone: '',
        mobile: '',
        email: '',
        address: '',
        notes: ''
      });
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;

    try {
      const { error } = await supabase
        .from('gift_sending_history')
        .insert([{
          ...giftForm,
          golf_course_contact_id: selectedContact.id
        }]);

      if (error) throw error;

      setShowGiftModal(false);
      setSelectedContact(null);
      setGiftForm({
        occasion: '',
        gift_type: '스타벅스 카드',
        gift_amount: 30000,
        quantity: 5,
        sent_date: new Date().toISOString().split('T')[0],
        sent_by: '',
        notes: ''
      });
      fetchGiftHistory();
      alert('선물 발송 이력이 기록되었습니다.');
    } catch (error) {
      console.error('Error saving gift history:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('golf_course_contacts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const openEditModal = (contact: GolfCourseContact) => {
    setEditingContact(contact);
    setForm({
      golf_course_name: contact.golf_course_name,
      contact_name: contact.contact_name,
      position: contact.position || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      email: contact.email || '',
      address: contact.address || '',
      notes: contact.notes || ''
    });
    setShowModal(true);
  };

  const openGiftModal = (contact: GolfCourseContact) => {
    setSelectedContact(contact);
    setShowGiftModal(true);
  };

  const openLetterModal = (contact: GolfCourseContact) => {
    setSelectedContact(contact);
    setShowLetterModal(true);
    // 편지 이력 조회
    setTimeout(() => {
      fetchLetterHistory();
    }, 100);
  };

  // AI 개선 기능
  const applyAIImprovement = async () => {
    if (!letterForm.custom_content || letterForm.custom_content.trim().length < 10) {
      alert('개선할 편지 내용을 먼저 작성해주세요.');
      return;
    }
    if (!aiImprovementRequest.trim()) {
      alert('AI 개선 요청사항을 입력해주세요.');
      return;
    }

    setIsAiImproving(true);
    try {
      console.log('🤖 손편지 AI 개선 시작...', aiImprovementRequest);
      
      const response = await fetch('/api/improve-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: letterForm.custom_content,
          improvementRequest: aiImprovementRequest,
          occasion: letterForm.occasion,
          golfCourseName: selectedContact?.golf_course_name || '',
          contactName: selectedContact?.contact_name || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.improvedContent) {
          setLetterForm(prev => ({
            ...prev,
            custom_content: data.improvedContent
          }));
          
          console.log('✅ 손편지 AI 개선 완료:', data.originalLength, '→', data.improvedLength, '자');
          alert(`🤖 AI 개선이 완료되었습니다!\n\n원본: ${data.originalLength}자 → 개선: ${data.improvedLength}자\n\n요청사항: ${aiImprovementRequest}`);
          
          // 요청사항 초기화
          setAiImprovementRequest('');
        } else {
          console.error('AI 개선 실패: 응답 데이터 없음');
          alert('AI 개선에 실패했습니다.');
        }
      } else {
        const error = await response.json();
        console.error('AI 개선 실패:', error);
        alert('AI 개선에 실패했습니다: ' + error.message);
      }
    } catch (error) {
      console.error('AI 개선 에러:', error);
      alert('AI 개선 중 오류가 발생했습니다: ' + error);
    } finally {
      setIsAiImproving(false);
    }
  };

  // 편지 저장 기능
  const saveLetter = async (status: 'draft' | 'sent' | 'printed' = 'draft') => {
    // 유효성 검사 강화
    if (!selectedContact) {
      alert('담당자를 선택해주세요.');
      return;
    }
    
    if (!letterForm.custom_content.trim()) {
      alert('편지 내용을 입력해주세요.');
      return;
    }
    
    if (!letterForm.occasion) {
      alert('발송 사유를 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 편지 저장 시작...', {
        status,
        contactId: selectedContact.id,
        occasion: letterForm.occasion,
        contentLength: letterForm.custom_content.length
      });
      
      const requestBody = {
        golfCourseContactId: selectedContact.id,
        occasion: letterForm.occasion,
        letterContent: letterForm.custom_content.trim(),
        aiImprovementRequest: aiImprovementRequest?.trim() || null,
        aiImprovedContent: letterForm.custom_content.trim(),
        sentDate: new Date().toISOString().split('T')[0],
        sentBy: '관리자',
        status,
        notes: `발송 사유: ${letterForm.occasion}${aiImprovementRequest ? ` | AI 개선: ${aiImprovementRequest}` : ''}`
      };

      const response = await fetch('/api/save-letter', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('✅ 편지 저장 완료:', responseData);
        
        const statusText = status === 'draft' ? '임시저장' : 
                          status === 'sent' ? '발송완료' : '인쇄완료';
        
        alert(`편지가 ${statusText}되었습니다!`);
        
        // 편지 이력 새로고침
        await fetchLetterHistory();
        
        // 임시저장이 아닌 경우 모달 닫기
        if (status !== 'draft') {
          setShowLetterModal(false);
          setLetterForm({ template: '', custom_content: '', occasion: '' });
          setAiImprovementRequest('');
        }
      } else {
        console.error('편지 저장 실패:', responseData);
        const errorMessage = responseData?.error || responseData?.message || '알 수 없는 오류가 발생했습니다.';
        alert(`편지 저장에 실패했습니다: ${errorMessage}`);
      }
    } catch (error) {
      console.error('편지 저장 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
      alert(`편지 저장 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 편지 이력 조회
  const fetchLetterHistory = async () => {
    if (!selectedContact) return;
    
    try {
      console.log('📝 편지 이력 조회 시작...', selectedContact.id);
      
      const response = await fetch(`/api/save-letter?contactId=${selectedContact.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 편지 이력 조회 완료:', data.letters?.length || 0, '개');
        setLetterHistory(data.letters || []);
      } else {
        const errorData = await response.json();
        console.error('편지 이력 조회 실패:', errorData);
        setLetterHistory([]);
      }
    } catch (error) {
      console.error('편지 이력 조회 에러:', error);
      setLetterHistory([]);
    }
  };

  // 순천 파인힐스 연락처 빠른 추가
  const addSuncheonPinehillsContacts = async () => {
    try {
      const contacts = [
        { contact_name: '예약실', position: '대표', phone: '061-750-9013', mobile: null, email: null, notes: '대표 예약실 - 추석, 설날 선물 발송 대상' },
        { contact_name: '회사 핸드폰', position: '회사', phone: null, mobile: '010-9520-9015', email: null, notes: '회사 공용 핸드폰 - 추석, 설날 선물 발송 대상' },
        { contact_name: '이경현', position: '매니저', phone: null, mobile: '010-7106-6908', email: null, notes: '현장 담당자 - 추석, 설날 선물 발송 대상' },
        { contact_name: '윤팀장', position: '팀장', phone: null, mobile: '010-8632-1195', email: null, notes: '팀장 - 추석, 설날 선물 발송 대상' }
      ];

      // 기존 순천 파인힐스 연락처 삭제
      await supabase
        .from('golf_course_contacts')
        .delete()
        .eq('golf_course_name', '순천 파인힐스');

      // 새 연락처 추가
      const newContacts = contacts.map(contact => ({
        golf_course_name: '순천 파인힐스',
        ...contact
      }));

      const { error } = await supabase
        .from('golf_course_contacts')
        .insert(newContacts);

      if (error) {
        console.error('연락처 추가 실패:', error);
        alert('연락처 추가에 실패했습니다: ' + error.message);
      } else {
        console.log('✅ 순천 파인힐스 연락처 추가 완료');
        alert('순천 파인힐스 연락처가 성공적으로 추가되었습니다!');
        fetchContacts(); // 목록 새로고침
        setShowQuickAddModal(false);
      }
    } catch (error) {
      console.error('연락처 추가 에러:', error);
      alert('연락처 추가 중 오류가 발생했습니다: ' + error);
    }
  };

  // 영덕 오션비치 연락처 빠른 추가
  const addOceanBeachContacts = async () => {
    try {
      const contacts = [
        { contact_name: '예약실', position: '대표', phone: '054-730-9001', mobile: null, email: null, notes: '대표 예약실 - 추석, 설날 선물 발송 대상' },
        { contact_name: '이초희', position: '회사', phone: null, mobile: '010-7324-9003', email: null, notes: '회사 핸드폰 - 추석, 설날 선물 발송 대상' },
        { contact_name: '김상관', position: '부장', phone: null, mobile: '010-8584-0839', email: null, notes: '부장 - 추석, 설날 선물 발송 대상' }
      ];

      // 기존 영덕 오션비치 연락처 삭제
      await supabase
        .from('golf_course_contacts')
        .delete()
        .eq('golf_course_name', '영덕 오션비치');

      // 새 연락처 추가
      const newContacts = contacts.map(contact => ({
        golf_course_name: '영덕 오션비치',
        ...contact
      }));

      const { error } = await supabase
        .from('golf_course_contacts')
        .insert(newContacts);

      if (error) {
        console.error('연락처 추가 실패:', error);
        alert('연락처 추가에 실패했습니다: ' + error.message);
      } else {
        console.log('✅ 영덕 오션비치 연락처 추가 완료');
        alert('영덕 오션비치 연락처가 성공적으로 추가되었습니다!');
        fetchContacts(); // 목록 새로고침
        setShowOceanBeachModal(false);
      }
    } catch (error) {
      console.error('연락처 추가 에러:', error);
      alert('연락처 추가 중 오류가 발생했습니다: ' + error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">골프장 담당자 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            순천 파인힐스
          </button>
          <button
            onClick={() => setShowOceanBeachModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            영덕 오션비치
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
            담당자 추가
          </button>
        </div>
      </div>

      {/* 담당자 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">골프장</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직책</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{contact.golf_course_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{contact.contact_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{contact.position || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {contact.phone && <div>📞 {contact.phone}</div>}
                      {contact.mobile && <div>📱 {contact.mobile}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(contact)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openGiftModal(contact)}
                        className="text-green-600 hover:text-green-900"
                        title="선물 발송 기록"
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openLetterModal(contact)}
                        className="text-purple-600 hover:text-purple-900"
                        title="손편지 발송"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 선물 발송 이력 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">선물 발송 이력</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">골프장</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사유</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선물</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발송일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {giftHistory.map((gift) => (
                  <tr key={gift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{gift.golf_course_contacts?.golf_course_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{gift.golf_course_contacts?.contact_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {gift.occasion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {gift.gift_type} {gift.quantity}장
                      </div>
                      <div className="text-sm text-gray-500">
                        {gift.gift_amount.toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(gift.sent_date).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 담당자 추가/편집 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingContact ? '담당자 편집' : '담당자 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">골프장명</label>
                <input
                  type="text"
                  value={form.golf_course_name}
                  onChange={(e) => setForm({ ...form, golf_course_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 예약팀장, 영업팀장"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">휴대폰</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">특이사항</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="선물 발송 이력, 선호 연락 시간 등"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  {editingContact ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingContact(null);
                    setForm({
                      golf_course_name: '',
                      contact_name: '',
                      position: '',
                      phone: '',
                      mobile: '',
                      email: '',
                      address: '',
                      notes: ''
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 선물 발송 기록 모달 */}
      {showGiftModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">선물 발송 기록</h2>
            <p className="text-sm text-gray-600 mb-4">
              {selectedContact.golf_course_name} - {selectedContact.contact_name}
            </p>
            <form onSubmit={handleGiftSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">발송 사유</label>
                <select
                  value={giftForm.occasion}
                  onChange={(e) => setGiftForm({ ...giftForm, occasion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="추석">추석</option>
                  <option value="설날">설날</option>
                  <option value="일반">일반</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">선물 종류</label>
                <input
                  type="text"
                  value={giftForm.gift_type}
                  onChange={(e) => setGiftForm({ ...giftForm, gift_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">금액 (원)</label>
                  <input
                    type="number"
                    value={giftForm.gift_amount}
                    onChange={(e) => setGiftForm({ ...giftForm, gift_amount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
                  <input
                    type="number"
                    value={giftForm.quantity}
                    onChange={(e) => setGiftForm({ ...giftForm, quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">발송일</label>
                <input
                  type="date"
                  value={giftForm.sent_date}
                  onChange={(e) => setGiftForm({ ...giftForm, sent_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">발송자</label>
                <input
                  type="text"
                  value={giftForm.sent_by}
                  onChange={(e) => setGiftForm({ ...giftForm, sent_by: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">특이사항</label>
                <textarea
                  value={giftForm.notes}
                  onChange={(e) => setGiftForm({ ...giftForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  기록 저장
                </button>
                <button
                  type="button"
                  onClick={() => setShowGiftModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 손편지 발송 모달 */}
      {showLetterModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">📝 고급 손편지 발송</h2>
              <p className="text-sm text-gray-600 mb-6">
                {selectedContact.golf_course_name} - {selectedContact.contact_name}
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 편집 패널 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">발송 사유</label>
                    <select
                      value={letterForm.occasion}
                      onChange={(e) => setLetterForm({ ...letterForm, occasion: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="추석">추석</option>
                      <option value="설날">설날</option>
                      <option value="일반">일반</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">편지 내용</label>
                    <textarea
                      value={letterForm.custom_content}
                      onChange={(e) => setLetterForm({ ...letterForm, custom_content: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={8}
                      placeholder="손편지 내용을 입력하세요..."
                    />
                  </div>

                  {/* AI 개선 기능 */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium mb-2 text-purple-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      🤖 AI 개선 기능
                    </h4>
                    <textarea
                      placeholder="예: 더 정중하게 다듬어주세요, 감사 표현을 강화해주세요, 전문성을 높여주세요, 따뜻한 톤으로 바꿔주세요..."
                      className="w-full p-3 border border-purple-300 rounded text-sm resize-none"
                      rows={3}
                      value={aiImprovementRequest}
                      onChange={(e) => setAiImprovementRequest(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={applyAIImprovement}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50"
                        disabled={!aiImprovementRequest.trim() || isAiImproving || !letterForm.custom_content.trim()}
                      >
                        {isAiImproving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            개선 중...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            AI 개선 적용
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiImprovementRequest('')}
                        className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      >
                        지우기
                      </button>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="space-y-3 pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                      >
                        {showPreview ? '편집하기' : '미리보기'}
                      </button>
                      <button
                        onClick={() => saveLetter('draft')}
                        disabled={isSaving || !letterForm.custom_content.trim() || !letterForm.occasion}
                        className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? '저장 중...' : '💾 임시저장'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveLetter('printed')}
                        disabled={isSaving || !letterForm.custom_content.trim() || !letterForm.occasion}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? '저장 중...' : '🖨️ 인쇄완료'}
                      </button>
                      <button
                        onClick={() => saveLetter('sent')}
                        disabled={isSaving || !letterForm.custom_content.trim() || !letterForm.occasion}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? '저장 중...' : '📤 발송완료'}
                      </button>
                      <button
                        onClick={() => setShowLetterModal(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>

                {/* 프리뷰 패널 */}
                <div className="lg:sticky lg:top-0">
                  {showPreview ? (
                    <PremiumLetterPreview
                      content={letterForm.custom_content}
                      occasion={letterForm.occasion}
                      golfCourseName={selectedContact.golf_course_name}
                      contactName={selectedContact.contact_name}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="text-gray-400 mb-4">
                        <Send className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">미리보기</h3>
                      <p className="text-sm text-gray-500">
                        편지 내용을 작성한 후 "미리보기" 버튼을 클릭하면<br />
                        고급스러운 손편지 디자인을 확인할 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 편지 이력 섹션 */}
              {letterHistory.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">📝 편지 발송 이력</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {letterHistory.map((letter) => (
                      <div key={letter.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-900">
                              {letter.occasion} 편지
                            </span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              letter.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              letter.status === 'sent' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {letter.status === 'draft' ? '임시저장' :
                               letter.status === 'sent' ? '발송완료' : '인쇄완료'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(letter.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2">
                          {letter.letter_content}
                        </div>
                        {letter.ai_improvement_request && (
                          <div className="text-xs text-purple-600 mt-1">
                            AI 개선: {letter.ai_improvement_request}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 순천 파인힐스 연락처 빠른 추가 모달 */}
      {showQuickAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">순천 파인힐스 연락처 추가</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">추가될 연락처 정보:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>예약실</strong> (대표) - 061-750-9013</li>
                  <li>• <strong>회사 핸드폰</strong> (회사) - 010-9520-9015</li>
                  <li>• <strong>이경현</strong> (매니저) - 010-7106-6908</li>
                  <li>• <strong>윤팀장</strong> (팀장) - 010-8632-1195</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 기존 순천 파인힐스 연락처는 모두 삭제되고 새로 추가됩니다.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={addSuncheonPinehillsContacts}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  연락처 추가하기
                </button>
                <button
                  onClick={() => setShowQuickAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 영덕 오션비치 연락처 빠른 추가 모달 */}
      {showOceanBeachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">영덕 오션비치 연락처 추가</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">추가될 연락처 정보:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>예약실</strong> (대표) - 054-730-9001</li>
                  <li>• <strong>이초희</strong> (회사) - 010-7324-9003</li>
                  <li>• <strong>김상관</strong> (부장) - 010-8584-0839</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 기존 영덕 오션비치 연락처는 모두 삭제되고 새로 추가됩니다.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={addOceanBeachContacts}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  연락처 추가하기
                </button>
                <button
                  onClick={() => setShowOceanBeachModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
