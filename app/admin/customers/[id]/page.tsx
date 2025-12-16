"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ArrowLeft, Save, Trash2, Edit, Phone, Mail, Calendar, 
  Tag, User, MapPin, Star, MessageSquare, X,
  Briefcase, Globe, TrendingUp, Clock, FileText
} from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber, handlePhoneInputChange, normalizePhoneNumber } from "@/lib/phoneUtils";

/**
 * customers.tags 변경 시 관련 참가자의 team_name 동기화
 */
const syncCustomerTagsToParticipantTeamName = async (
  phone: string,
  tags: string[] | null
): Promise<void> => {
  if (!phone || !tags || tags.length === 0) {
    return;
  }

  try {
    // 첫 번째 tag를 team_name으로 사용
    const teamName = tags[0];

    // 해당 전화번호를 가진 참가자들의 team_name 업데이트
    const { error } = await supabase
      .from("singsing_participants")
      .update({ team_name: teamName })
      .eq("phone", phone)
      .is("team_name", null); // team_name이 null인 경우만 업데이트

    if (error) {
      console.error("참가자 team_name 동기화 오류:", error);
    }
  } catch (error) {
    console.error("tags 동기화 오류:", error);
  }
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  marketing_agreed: boolean;
  marketing_agreed_at?: string | null;
  kakao_friend: boolean;
  kakao_friend_at?: string | null;
  status: string;
  customer_type?: string | null;
  first_tour_date?: string | null;
  last_tour_date?: string | null;
  total_tour_count: number;
  total_payment_amount: number;
  source?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  position?: string | null;
  activity_platform?: string | null;
  referral_source?: string | null;
  last_contact_at?: string | null;
  unsubscribed?: boolean;
  unsubscribed_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    birth_date: "",
    gender: "",
    marketing_agreed: false,
    kakao_friend: false,
    status: "active",
    customer_type: "regular",
    notes: "",
    tags: [] as string[],
    position: "",
    activity_platform: "",
    referral_source: "",
    first_tour_date: "",
    last_tour_date: "",
    last_tour_location: "",
    last_contact_at: "",
    unsubscribed: false,
    unsubscribed_reason: "",
  });

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setCustomer(data);
        
        // notes에서 최근 투어지 추출
        let lastTourLocation = "";
        if (data.notes) {
          const tourLocationMatch = data.notes.match(/최근 투어지:\s*([^|]+)/);
          if (tourLocationMatch) {
            lastTourLocation = tourLocationMatch[1].trim();
          }
        }
        
        setForm({
          name: data.name || "",
          phone: formatPhoneNumber(data.phone) || "",
          email: data.email || "",
          birth_date: data.birth_date || "",
          gender: data.gender || "",
          marketing_agreed: data.marketing_agreed || false,
          kakao_friend: data.kakao_friend || false,
          status: data.status || "active",
          customer_type: data.customer_type || "regular",
          notes: data.notes || "",
          tags: data.tags || [],
          position: data.position || "",
          activity_platform: data.activity_platform || "",
          referral_source: data.referral_source || "",
          first_tour_date: data.first_tour_date || "",
          last_tour_date: data.last_tour_date || "",
          last_tour_location: lastTourLocation,
          last_contact_at: data.last_contact_at ? new Date(data.last_contact_at).toISOString().slice(0, 16) : "",
          unsubscribed: data.unsubscribed || false,
          unsubscribed_reason: data.unsubscribed_reason || "",
        });
      }
    } catch (error: any) {
      console.error("조회 오류:", error);
      alert(`고객 정보를 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 전화번호 정규화
      const normalizedPhone = normalizePhoneNumber(form.phone);
      if (normalizedPhone.length !== 11 || !normalizedPhone.startsWith('010')) {
        alert("올바른 전화번호 형식이 아닙니다. (010-XXXX-XXXX)");
        return;
      }

      // notes에 최근 투어지 추가
      let notes = form.notes || "";
      if (form.last_tour_location) {
        const tourLocationNote = `최근 투어지: ${form.last_tour_location}`;
        if (notes && !notes.includes(tourLocationNote)) {
          notes = notes.includes("최근 투어지:") 
            ? notes.replace(/최근 투어지:[^|]*/, tourLocationNote)
            : `${notes} | ${tourLocationNote}`;
        } else if (!notes) {
          notes = tourLocationNote;
        }
      }

      // 빈 문자열을 null로 변환하는 헬퍼
      const toNullIfEmpty = (value: string | null | undefined): string | null => {
        if (!value || (typeof value === 'string' && value.trim() === "")) return null;
        return value;
      };

      const customerData: any = {
        name: form.name,
        phone: normalizedPhone,
        email: toNullIfEmpty(form.email),
        birth_date: toNullIfEmpty(form.birth_date),
        gender: toNullIfEmpty(form.gender),
        status: form.status,
        customer_type: form.customer_type,
        position: toNullIfEmpty(form.position),
        activity_platform: toNullIfEmpty(form.activity_platform),
        referral_source: toNullIfEmpty(form.referral_source),
        first_tour_date: toNullIfEmpty(form.first_tour_date),
        last_tour_date: toNullIfEmpty(form.last_tour_date),
        notes: notes || null,
        tags: form.tags && form.tags.length > 0 ? form.tags : null,
        marketing_agreed_at: form.marketing_agreed ? new Date().toISOString() : null,
        kakao_friend_at: form.kakao_friend ? new Date().toISOString() : null,
        last_contact_at: (form.last_contact_at && typeof form.last_contact_at === 'string' && form.last_contact_at.trim() !== "") 
          ? new Date(form.last_contact_at).toISOString() 
          : null,
        unsubscribed: form.unsubscribed || false,
        unsubscribed_reason: form.unsubscribed ? toNullIfEmpty(form.unsubscribed_reason) : null,
      };

      const { error } = await supabase
        .from("customers")
        .update(customerData)
        .eq("id", id);

      if (error) throw error;

      // tags가 변경되었으면 관련 참가자의 team_name 동기화
      if (form.tags && form.tags.length > 0) {
        await syncCustomerTagsToParticipantTeamName(normalizedPhone, form.tags);
      }

      alert("수정되었습니다.");
      setIsEditing(false);
      fetchCustomer();
    } catch (error: any) {
      console.error("저장 오류:", error);
      alert(`저장에 실패했습니다: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`정말 "${form.name}" 고객을 삭제하시겠습니까?`)) return;

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("삭제되었습니다.");
      router.push("/admin/customers");
    } catch (error: any) {
      console.error("삭제 오류:", error);
      alert(`삭제에 실패했습니다: ${error.message}`);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    setForm({ 
      ...form, 
      tags: form.tags.filter(t => t !== tag) 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">고객을 찾을 수 없습니다.</p>
          <Link
            href="/admin/customers"
            className="text-blue-600 hover:text-blue-800"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "고객 정보 수정" : "고객 상세 정보"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {customer.customer_type === "vip" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                  VIP
                </span>
              )}
              고객 ID: {customer.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              수정
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 내용 */}
      {isEditing ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-8">
            {/* 기본 정보 */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                기본 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => handlePhoneInputChange(e.target.value, (value) => setForm({ ...form, phone: value }))}
                    onBlur={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setForm({ ...form, phone: formatted });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="010-0000-0000"
                    maxLength={13}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    생년월일
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    성별
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택안함</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="blocked">차단</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    고객 유형
                  </label>
                  <select
                    name="customer_type"
                    value={form.customer_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="regular">일반</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 고객 분류 정보 */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                고객 분류 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    직급
                  </label>
                  <select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택안함</option>
                    <option value="총무">총무</option>
                    <option value="회장">회장</option>
                    <option value="방장">방장</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    활동 플랫폼
                  </label>
                  <select
                    name="activity_platform"
                    value={form.activity_platform}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택안함</option>
                    <option value="밴드">밴드</option>
                    <option value="당근마켓">당근마켓</option>
                    <option value="모임(오프라인)">모임(오프라인)</option>
                    <option value="카카오톡">카카오톡</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    유입경로
                  </label>
                  <select
                    name="referral_source"
                    value={form.referral_source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택안함</option>
                    <option value="네이버블로그">네이버블로그</option>
                    <option value="홈페이지">홈페이지</option>
                    <option value="네이버검색">네이버검색</option>
                    <option value="구글검색">구글검색</option>
                    <option value="지인추천">지인추천</option>
                    <option value="페이스북 광고">페이스북 광고</option>
                    <option value="인스타그램 광고">인스타그램 광고</option>
                    <option value="카카오톡 채널">카카오톡 채널</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 투어 이력 */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                투어 이력
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    최초 문의일
                  </label>
                  <input
                    type="date"
                    name="first_tour_date"
                    value={form.first_tour_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    최근 투어일
                  </label>
                  <input
                    type="date"
                    name="last_tour_date"
                    value={form.last_tour_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    최근 투어지
                  </label>
                  <input
                    type="text"
                    name="last_tour_location"
                    value={form.last_tour_location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 순천파인힐스CC, 화순+나주"
                  />
                </div>
              </div>
            </div>

            {/* 연락 정보 */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                연락 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    최근 연락
                  </label>
                  <input
                    type="datetime-local"
                    name="last_contact_at"
                    value={form.last_contact_at}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="marketing_agreed"
                      checked={form.marketing_agreed}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      마케팅 수신 동의
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="kakao_friend"
                      checked={form.kakao_friend}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      카카오 친구 추가
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="unsubscribed"
                      checked={form.unsubscribed}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">수신거부</span>
                  </label>
                  {form.unsubscribed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        수신거부 사유
                      </label>
                      <textarea
                        name="unsubscribed_reason"
                        value={form.unsubscribed_reason}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="수신거부 사유를 입력하세요"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 모임명 및 메모 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                모임명 및 메모
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    모임명 (태그)
                    <span className="ml-2 text-xs text-gray-500 font-normal">(여러 모임명을 태그로 추가할 수 있습니다)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="모임명 입력 후 Enter (예: 일삼일사회, 변연화팀)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    메모
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="고객에 대한 메모를 입력하세요"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 저장/취소 버튼 */}
          <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsEditing(false);
                fetchCustomer();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 기본 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              기본 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">전화번호</p>
                  <p className="text-lg font-semibold text-gray-900">{formatPhoneNumber(customer.phone)}</p>
                </div>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="text-lg font-semibold text-gray-900">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer.birth_date && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">생년월일</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(customer.birth_date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">성별</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {customer.gender === 'male' ? '남성' : customer.gender === 'female' ? '여성' : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Star className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">상태</p>
                  <span className={`inline-flex px-2 py-1 rounded text-sm font-medium
                    ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                      customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'}`}>
                    {customer.status === 'active' ? '활성' : 
                     customer.status === 'inactive' ? '비활성' : '차단'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 고객 분류 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              고객 분류 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.position && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">직급</p>
                    <p className="text-lg font-semibold text-gray-900">{customer.position}</p>
                  </div>
                </div>
              )}
              {customer.tags && customer.tags.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">모임명</p>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {customer.activity_platform && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">활동 플랫폼</p>
                    <p className="text-lg font-semibold text-gray-900">{customer.activity_platform}</p>
                  </div>
                </div>
              )}
              {customer.referral_source && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">유입경로</p>
                    <p className="text-lg font-semibold text-gray-900">{customer.referral_source}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 투어 이력 카드 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              투어 이력
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">총 투어 횟수</p>
                  <p className="text-2xl font-bold text-gray-900">{customer.total_tour_count}회</p>
                </div>
              </div>
              {customer.first_tour_date && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">최초 문의일</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(customer.first_tour_date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              )}
              {customer.last_tour_date && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">최근 투어일</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(customer.last_tour_date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              )}
              {customer.notes && customer.notes.includes('최근 투어지:') && (
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">최근 투어지</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.notes.match(/최근 투어지:\s*([^|]+)/)?.[1]?.trim() || '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 연락 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              연락 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.last_contact_at && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">최근 연락</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(customer.last_contact_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">마케팅 동의</p>
                  <span className={`inline-flex px-2 py-1 rounded text-sm font-medium
                    ${customer.marketing_agreed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {customer.marketing_agreed ? '동의' : '미동의'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">카카오 친구</p>
                  <span className={`inline-flex px-2 py-1 rounded text-sm font-medium
                    ${customer.kakao_friend ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {customer.kakao_friend ? '추가됨' : '미추가'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">수신거부</p>
                  <span className={`inline-flex px-2 py-1 rounded text-sm font-medium
                    ${customer.unsubscribed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {customer.unsubscribed ? '수신거부' : '수신동의'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 메모 카드 */}
          {customer.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                메모 및 특이사항
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}

          {/* 메타 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">메타 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">등록일</p>
                <p className="text-gray-900 font-medium">
                  {new Date(customer.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">최종 수정일</p>
                <p className="text-gray-900 font-medium">
                  {new Date(customer.updated_at).toLocaleString('ko-KR')}
                </p>
              </div>
              {customer.source && (
                <div>
                  <p className="text-gray-500">데이터 출처</p>
                  <p className="text-gray-900 font-medium">{customer.source}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

