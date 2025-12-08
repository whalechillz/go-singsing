"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Plus, Search, Calendar, Users, Building2, Filter } from "lucide-react";
import type { MeetingMinute } from "@/@types/meeting";

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingMinute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "phone" | "in_person" | "online">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");

  useEffect(() => {
    fetchMeetings();
    fetchPartners();
  }, []);

  const [partners, setPartners] = useState<any[]>([]);

  const fetchPartners = async () => {
    try {
      const { data } = await supabase
        .from("partner_companies")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (data) setPartners(data);
    } catch (error) {
      console.error("협업 업체 조회 오류:", error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_minutes")
        .select(`
          *,
          partner_company:partner_companies(id, name)
        `)
        .order("meeting_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("회의록 조회 오류 상세:", error);
        throw error;
      }
      
      console.log("조회된 회의록 수:", data?.length || 0);
      setMeetings(data || []);
    } catch (error: any) {
      console.error("회의록 조회 오류:", error);
      alert(`회의록 목록을 불러오는데 실패했습니다: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.agenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.discussion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.partner_company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || meeting.meeting_type === typeFilter;
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    const matchesPartner = partnerFilter === "all" || meeting.partner_company_id === partnerFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPartner;
  });

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case "phone": return "전화";
      case "in_person": return "대면";
      case "online": return "온라인";
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "초안";
      case "published": return "게시";
      case "archived": return "보관";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "published": return "bg-green-100 text-green-800";
      case "archived": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
          <FileText className="w-6 h-6" />
          회의록 관리
        </h1>
        <button
          onClick={() => router.push("/admin/meetings/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          회의록 작성
        </button>
      </div>

      {/* 필터 */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="제목, 내용, 업체명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">전체 유형</option>
              <option value="phone">전화</option>
              <option value="in_person">대면</option>
              <option value="online">온라인</option>
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">전체 상태</option>
            <option value="draft">초안</option>
            <option value="published">게시</option>
            <option value="archived">보관</option>
          </select>
          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">전체 업체</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 회의록 목록 */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {searchTerm || typeFilter !== "all" || statusFilter !== "all" || partnerFilter !== "all"
              ? "검색 결과가 없습니다." 
              : "등록된 회의록이 없습니다."}
          </p>
          {!searchTerm && typeFilter === "all" && statusFilter === "all" && partnerFilter === "all" && (
            <button
              onClick={() => router.push("/admin/meetings/new")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              첫 회의록 작성하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => router.push(`/admin/meetings/${meeting.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* 헤더 */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(meeting.meeting_date).toLocaleDateString("ko-KR")}
                      {meeting.meeting_time && ` ${meeting.meeting_time}`}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(meeting.status)}`}>
                  {getStatusLabel(meeting.status)}
                </span>
              </div>

              {/* 업체 정보 */}
              {meeting.partner_company && (
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{meeting.partner_company.name}</span>
                </div>
              )}

              {/* 회의 유형 */}
              <div className="mb-3">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                  {getMeetingTypeLabel(meeting.meeting_type)}
                </span>
                {meeting.meeting_location && (
                  <span className="ml-2 text-xs text-gray-500">{meeting.meeting_location}</span>
                )}
              </div>

              {/* 참석자 수 */}
              {meeting.attendees && meeting.attendees.length > 0 && (
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>참석자 {meeting.attendees.length}명</span>
                </div>
              )}

              {/* Action Items */}
              {meeting.action_items && meeting.action_items.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Action Items</div>
                  <div className="flex gap-1 flex-wrap">
                    {meeting.action_items.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs ${
                          item.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : item.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.task}
                      </span>
                    ))}
                    {meeting.action_items.length > 3 && (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        +{meeting.action_items.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 태그 */}
              {meeting.tags && meeting.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {meeting.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 미리보기 */}
              {meeting.agenda && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {meeting.agenda}
                </p>
              )}

              {/* 첨부파일 수 */}
              {meeting.attachments && meeting.attachments.length > 0 && (
                <div className="text-xs text-gray-500 pt-3 border-t">
                  첨부파일 {meeting.attachments.length}개
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


