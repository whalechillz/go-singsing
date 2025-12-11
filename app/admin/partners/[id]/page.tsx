"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Save, Trash2, Edit, Phone, Mail, Globe, MapPin, Calendar, Heart } from "lucide-react";
import Link from "next/link";
import type { PartnerCompany } from "@/@types/partner";
import { formatPhoneNumber, handlePhoneInputChange, normalizePhoneNumber } from "@/lib/phoneUtils";

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [partner, setPartner] = useState<PartnerCompany | null>(null);
  const [form, setForm] = useState({
    name: "",
    country: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    kakao_talk_id: "",
    nateon_id: "",
    facebook_url: "",
    website_url: "",
    address: "",
    notes: "",
    status: "active" as "active" | "inactive",
    category: "" as "" | "해외업체" | "해외랜드" | "국내부킹" | "국내 버스패키지" | "버스기사" | "프로" | "기타",
    is_favorite: false,
  });

  useEffect(() => {
    if (id) {
      fetchPartner();
    }
  }, [id]);

  const fetchPartner = async () => {
    try {
      const { data, error } = await supabase
        .from("partner_companies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setPartner(data);
        setForm({
          name: data.name || "",
          country: data.country || "",
          contact_person: data.contact_person || "",
          contact_phone: formatPhoneNumber(data.contact_phone) || "",
          contact_email: data.contact_email || "",
          kakao_talk_id: data.kakao_talk_id || "",
          nateon_id: data.nateon_id || "",
          facebook_url: data.facebook_url || "",
          website_url: data.website_url || "",
          address: data.address || "",
          notes: data.notes || "",
          status: data.status || "active",
          category: data.category || "",
          is_favorite: data.is_favorite || false,
        });
      }
    } catch (error: any) {
      console.error("조회 오류:", error);
      alert(`협업 업체 정보를 불러오는데 실패했습니다: ${error.message}`);
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
    if (!form.name.trim()) {
      alert("업체명을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("partner_companies")
        .update(form)
        .eq("id", id);

      if (error) throw error;

      alert("수정되었습니다.");
      setIsEditing(false);
      fetchPartner();
    } catch (error: any) {
      console.error("수정 오류:", error);
      alert(`수정에 실패했습니다: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`정말 "${form.name}" 업체를 삭제하시겠습니까?`)) return;

    try {
      const { error } = await supabase
        .from("partner_companies")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("삭제되었습니다.");
      router.push("/admin/partners");
    } catch (error: any) {
      console.error("삭제 오류:", error);
      alert(`삭제에 실패했습니다: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">협업 업체를 찾을 수 없습니다.</p>
          <Link
            href="/admin/partners"
            className="text-blue-600 hover:text-blue-800"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/partners"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "협업 업체 수정" : "협업 업체 상세"}
          </h1>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    업체명 <span className="text-red-500">*</span>
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
                    국가/지역
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    업체 분류
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택안함</option>
                    <option value="해외업체">해외업체</option>
                    <option value="해외랜드">해외랜드</option>
                    <option value="국내부킹">국내부킹</option>
                    <option value="국내 버스패키지">국내 버스패키지</option>
                    <option value="버스기사">버스기사</option>
                    <option value="프로">프로</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_favorite"
                      checked={form.is_favorite}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      긴밀 협력 업체
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 연락처 정보 */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    담당자명
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    value={form.contact_person}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={form.contact_phone}
                    onChange={(e) => {
                      handlePhoneInputChange(e.target.value, (value) => {
                        setForm({ ...form, contact_phone: value });
                      });
                    }}
                    onBlur={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setForm({ ...form, contact_phone: formatted });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="010-0000-0000"
                    maxLength={13}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={form.contact_email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카카오톡 ID
                  </label>
                  <input
                    type="text"
                    name="kakao_talk_id"
                    value={form.kakao_talk_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    네이트온 ID
                  </label>
                  <input
                    type="text"
                    name="nateon_id"
                    value={form.nateon_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 웹사이트 정보 */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">웹사이트 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    페이스북 URL
                  </label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={form.facebook_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    웹사이트 URL
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    value={form.website_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 기타 정보 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기타 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비고
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              onClick={() => {
                setIsEditing(false);
                fetchPartner();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 기본 정보 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">업체명</span>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900">{partner.name}</p>
                  {partner.is_favorite && (
                    <div title="긴밀 협력 업체">
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {partner.category && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {partner.category}
                  </span>
                )}
                {partner.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{partner.country}</span>
                  </div>
                )}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  partner.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {partner.status === "active" ? "활성" : "비활성"}
                </span>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          {(partner.contact_person || partner.contact_phone || partner.contact_email || partner.kakao_talk_id || partner.nateon_id || partner.facebook_url || partner.website_url) && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">연락처 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {partner.contact_person && (
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">담당자</div>
                    <div className="text-sm font-semibold text-gray-900">{partner.contact_person}</div>
                  </div>
                )}
                {partner.contact_phone && (
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div className="text-xs font-medium text-gray-500 uppercase">전화번호</div>
                    </div>
                    <a href={`tel:${partner.contact_phone?.replace(/-/g, '')}`} className="text-sm text-blue-600 hover:underline font-medium">
                      {formatPhoneNumber(partner.contact_phone)}
                    </a>
                  </div>
                )}
                {partner.contact_email && (
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div className="text-xs font-medium text-gray-500 uppercase">이메일</div>
                    </div>
                    <a href={`mailto:${partner.contact_email}`} className="text-sm text-blue-600 hover:underline truncate block">
                      {partner.contact_email}
                    </a>
                  </div>
                )}
                {partner.kakao_talk_id && (
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">카카오톡 ID</div>
                    <div className="text-sm text-gray-900 font-medium">{partner.kakao_talk_id}</div>
                  </div>
                )}
                {partner.nateon_id && (
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">네이트온 ID</div>
                    <div className="text-sm text-gray-900 font-medium">{partner.nateon_id}</div>
                  </div>
                )}
                {partner.facebook_url && (
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <div className="text-xs font-medium text-gray-500 uppercase">페이스북</div>
                    </div>
                    <a href={partner.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                      링크 열기
                    </a>
                  </div>
                )}
                {partner.website_url && (
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div className="text-xs font-medium text-gray-500 uppercase">웹사이트</div>
                    </div>
                    <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                      링크 열기
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 기타 정보 */}
          {(partner.address || partner.notes) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기타 정보</h2>
              <div className="space-y-3">
                {partner.address && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">주소</span>
                    <p className="text-gray-700">{partner.address}</p>
                  </div>
                )}
                {partner.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">비고</span>
                    <p className="text-gray-700 whitespace-pre-wrap">{partner.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 메타 정보 */}
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>
                등록일: {new Date(partner.created_at).toLocaleDateString("ko-KR")}
              </span>
              {partner.updated_at !== partner.created_at && (
                <>
                  <span>•</span>
                  <span>
                    수정일: {new Date(partner.updated_at).toLocaleDateString("ko-KR")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


