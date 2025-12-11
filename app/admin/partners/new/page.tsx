"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Save, Heart } from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber, handlePhoneInputChange, normalizePhoneNumber } from "@/lib/phoneUtils";

export default function PartnerNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert("업체명을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 전화번호 정규화
      const normalizedForm = {
        ...form,
        contact_phone: normalizePhoneNumber(form.contact_phone) || null,
      };
      
      const { error } = await supabase
        .from("partner_companies")
        .insert([normalizedForm]);

      if (error) throw error;

      alert("협업 업체가 등록되었습니다.");
      router.push("/admin/partners");
    } catch (error: any) {
      console.error("등록 오류:", error);
      alert(`등록에 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/partners"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">협업 업체 등록</h1>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div>
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
                  placeholder="예: 베트남 하노이"
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
          <div>
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
                    placeholder="010-0000-0000"
                    maxLength={13}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="example@email.com"
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
                  placeholder="yang1912"
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
                  placeholder="nateon_id"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 웹사이트 정보 */}
          <div>
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
                  placeholder="https://facebook.com/..."
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
                  placeholder="https://example.com"
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
                  placeholder="추가 정보나 메모를 입력하세요..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <Link
            href="/admin/partners"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}


