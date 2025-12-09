"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Handshake, Plus, Search, Edit, Trash2, Phone, Mail, Globe, MapPin, Grid, List, Heart } from "lucide-react";
import type { PartnerCompany } from "@/@types/partner";

type ViewMode = 'card' | 'list';
type CategoryFilter = 'all' | '해외업체' | '해외랜드' | '국내부킹' | '국내 버스패키지' | '버스기사' | '프로' | '기타';

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [favoriteFilter, setFavoriteFilter] = useState<"all" | "favorite">("all");

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partner_companies")
        .select("*")
        .order("is_favorite", { ascending: false })
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

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("partner_companies")
        .update({ is_favorite: !currentFavorite })
        .eq("id", id);

      if (error) throw error;
      fetchPartners();
    } catch (error) {
      console.error("즐겨찾기 토글 오류:", error);
      alert("즐겨찾기 설정에 실패했습니다.");
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || partner.category === categoryFilter;
    const matchesFavorite = favoriteFilter === "all" || partner.is_favorite === true;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesFavorite;
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

      {/* 필터 및 뷰 전환 */}
      <div className="mb-6 flex gap-4 items-center">
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
          <option value="all">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 분류</option>
          <option value="해외업체">해외업체</option>
          <option value="해외랜드">해외랜드</option>
          <option value="국내부킹">국내부킹</option>
          <option value="국내 버스패키지">국내 버스패키지</option>
          <option value="버스기사">버스기사</option>
          <option value="프로">프로</option>
          <option value="기타">기타</option>
        </select>
        <select
          value={favoriteFilter}
          onChange={(e) => setFavoriteFilter(e.target.value as "all" | "favorite")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체</option>
          <option value="favorite">⭐ 긴밀 협력</option>
        </select>
        {/* 뷰 전환 버튼 */}
        <div className="flex gap-1 border rounded-lg p-1 bg-gray-50">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'card' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="카드 뷰"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="리스트 뷰"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 업체 목록 */}
      {filteredPartners.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== "all" || categoryFilter !== "all" || favoriteFilter !== "all"
              ? "검색 결과가 없습니다." 
              : "등록된 협업 업체가 없습니다."}
          </p>
          {!searchTerm && statusFilter === "all" && categoryFilter === "all" && favoriteFilter === "all" && (
            <button
              onClick={() => router.push("/admin/partners/new")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              첫 업체 등록하기
            </button>
          )}
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* 헤더 */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {partner.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(partner.id, partner.is_favorite || false);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title={partner.is_favorite ? "긴밀 협력 해제" : "긴밀 협력으로 설정"}
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          partner.is_favorite 
                            ? "fill-red-500 text-red-500" 
                            : "text-gray-400 hover:text-red-500"
                        } transition-colors`} 
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {partner.category && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {partner.category}
                      </span>
                    )}
                    {partner.country && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{partner.country}</span>
                      </div>
                    )}
                  </div>
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
              <div className="mb-4 space-y-2">
                {partner.contact_person && (
                  <div className="pb-2 border-b border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">담당자</div>
                    <div className="text-sm font-semibold text-gray-900">{partner.contact_person}</div>
                  </div>
                )}
                <div className="space-y-1.5 pt-1">
                  {partner.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`tel:${partner.contact_phone}`} className="hover:text-blue-600 hover:underline">
                        {partner.contact_phone}
                      </a>
                    </div>
                  )}
                  {partner.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`mailto:${partner.contact_email}`} className="hover:text-blue-600 hover:underline truncate">
                        {partner.contact_email}
                      </a>
                    </div>
                  )}
                  {partner.kakao_talk_id && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-yellow-500 flex-shrink-0">💬</span>
                      <span>카톡: {partner.kakao_talk_id}</span>
                    </div>
                  )}
                  {partner.nateon_id && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 flex-shrink-0">💬</span>
                      <span>네이트온: {partner.nateon_id}</span>
                    </div>
                  )}
                  {partner.facebook_url && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <a href={partner.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        페이스북
                      </a>
                    </div>
                  )}
                  {partner.website_url && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        웹사이트
                      </a>
                    </div>
                  )}
                </div>
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
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  업체명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  분류
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지역
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  담당자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(partner.id, partner.is_favorite || false)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title={partner.is_favorite ? "긴밀 협력 해제" : "긴밀 협력으로 설정"}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            partner.is_favorite 
                              ? "fill-red-500 text-red-500" 
                              : "text-gray-400 hover:text-red-500"
                          } transition-colors`} 
                        />
                      </button>
                      <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {partner.category ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {partner.category}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.country || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.contact_person || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      {partner.contact_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{partner.contact_phone}</span>
                        </div>
                      )}
                      {partner.kakao_talk_id && (
                        <div className="text-xs text-gray-400">카톡: {partner.kakao_talk_id}</div>
                      )}
                      {partner.nateon_id && (
                        <div className="text-xs text-gray-400">네이트온: {partner.nateon_id}</div>
                      )}
                      {partner.facebook_url && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          <Globe className="w-3 h-3 inline mr-1" />
                          페이스북
                        </div>
                      )}
                      {!partner.contact_phone && !partner.kakao_talk_id && !partner.nateon_id && !partner.facebook_url && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        partner.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {partner.status === "active" ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/partners/${partner.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id, partner.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


