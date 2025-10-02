"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit, Trash2, Send, Gift } from 'lucide-react';

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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          담당자 추가
        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">손편지 발송</h2>
            <p className="text-sm text-gray-600 mb-4">
              {selectedContact.golf_course_name} - {selectedContact.contact_name}
            </p>
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
                  rows={10}
                  placeholder="손편지 내용을 입력하세요..."
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">💡 팁</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 손편지 느낌의 따뜻한 인사말을 작성해보세요</li>
                  <li>• 골프장과의 좋은 관계를 강조하는 내용을 포함하세요</li>
                  <li>• 감사 인사와 앞으로의 협력을 언급하세요</li>
                </ul>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    // 실제 발송 로직 구현
                    alert('손편지 발송 기능은 추후 구현 예정입니다.');
                    setShowLetterModal(false);
                  }}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                >
                  발송하기
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
        </div>
      )}
    </div>
  );
}
