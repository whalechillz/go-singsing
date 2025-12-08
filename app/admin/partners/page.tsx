"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Handshake, Plus, Search, Edit, Trash2, Phone, Mail, Globe, MapPin } from "lucide-react";
import type { PartnerCompany } from "@/@types/partner";

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partner_companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("협업 업체 조회 오류:", error);
      alert("협업 업체 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`정말 "${name}" 업체를 삭제하시겠습니까?`)) return;

    try {
      const { error } = await supabase
        .from("partner_companies")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("삭제되었습니다.");
      fetchPartners();
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Handshake className="w-6 h-6" />
          협업 업체 관리
        </h1>
        <button
          onClick={() => router.push("/admin/partners/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          업체 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="업체명, 담당자명, 국가로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </div>

      {/* 업체 목록 */}
      {filteredPartners.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "검색 결과가 없습니다." 
              : "등록된 협업 업체가 없습니다."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => router.push("/admin/partners/new")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              첫 업체 등록하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* 헤더 */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {partner.name}
                  </h3>
                  {partner.country && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{partner.country}</span>
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    partner.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {partner.status === "active" ? "활성" : "비활성"}
                </span>
              </div>

              {/* 연락처 정보 */}
              <div className="space-y-2 mb-4">
                {partner.contact_person && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">담당자:</span> {partner.contact_person}
                  </div>
                )}
                {partner.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{partner.contact_phone}</span>
                  </div>
                )}
                {partner.contact_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{partner.contact_email}</span>
                  </div>
                )}
                {partner.kakao_talk_id && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">카카오톡:</span> {partner.kakao_talk_id}
                  </div>
                )}
                {(partner.facebook_url || partner.website_url) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span className="truncate">
                      {partner.facebook_url || partner.website_url}
                    </span>
                  </div>
                )}
              </div>

              {/* 비고 */}
              {partner.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 line-clamp-2">{partner.notes}</p>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => router.push(`/admin/partners/${partner.id}`)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  수정
                </button>
                <button
                  onClick={() => handleDelete(partner.id, partner.name)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


