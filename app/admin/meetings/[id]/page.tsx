"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Edit, Trash2, Calendar, Users, Building2, FileText, CheckSquare, Tag } from "lucide-react";
import Link from "next/link";
import type { MeetingMinute, Attendee, ActionItem } from "@/@types/meeting";
import MeetingAttachmentUploader from "@/components/admin/meetings/MeetingAttachmentUploader";

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<MeetingMinute | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "comparison" | "actions" | "attachments">("content");

  useEffect(() => {
    if (id) {
      fetchMeeting();
    }
  }, [id]);

  const fetchMeeting = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_minutes")
        .select(`
          *,
          partner_company:partner_companies(id, name, country),
          attachments:meeting_minute_attachments(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setMeeting(data);
    } catch (error: any) {
      console.error("조회 오류:", error);
      alert(`회의록을 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 회의록을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("meeting_minutes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("삭제되었습니다.");
      router.push("/admin/meetings");
    } catch (error: any) {
      console.error("삭제 오류:", error);
      alert(`삭제에 실패했습니다: ${error.message}`);
    }
  };

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

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">회의록을 찾을 수 없습니다.</p>
          <Link
            href="/admin/meetings"
            className="text-blue-600 hover:text-blue-800"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/meetings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(meeting.meeting_date).toLocaleDateString("ko-KR")}
                  {meeting.meeting_time && ` ${meeting.meeting_time}`}
                </span>
              </div>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                {getMeetingTypeLabel(meeting.meeting_type)}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(meeting.status)}`}>
                {getStatusLabel(meeting.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/meetings/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
        </div>
      </div>

      {/* 기본 정보 카드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meeting.partner_company && (
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">협업 업체</span>
                <p className="font-medium text-gray-900">{meeting.partner_company.name}</p>
                {meeting.partner_company.country && (
                  <p className="text-sm text-gray-500">{meeting.partner_company.country}</p>
                )}
              </div>
            </div>
          )}
          {meeting.meeting_location && (
            <div>
              <span className="text-sm text-gray-500">회의 장소</span>
              <p className="font-medium text-gray-900">{meeting.meeting_location}</p>
            </div>
          )}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">참석자</span>
                <p className="font-medium text-gray-900">{meeting.attendees.length}명</p>
              </div>
            </div>
          )}
          {meeting.tags && meeting.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">태그</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {meeting.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "content"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              회의록 내용
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "comparison"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              비교표
            </button>
            {meeting.action_items && meeting.action_items.length > 0 && (
              <button
                onClick={() => setActiveTab("actions")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "actions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <CheckSquare className="w-4 h-4 inline mr-2" />
                Action Items ({meeting.action_items.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab("attachments")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "attachments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              첨부파일 ({meeting.attachments?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 회의록 내용 탭 */}
          {activeTab === "content" && (
            <div className="space-y-6">
              {/* 참석자 목록 */}
              {meeting.attendees && meeting.attendees.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    참석자
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meeting.attendees.map((attendee: Attendee, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{attendee.name}</p>
                            <div className="text-sm text-gray-600 mt-1">
                              {attendee.role && <span>{attendee.role}</span>}
                              {attendee.role && attendee.company && <span> • </span>}
                              {attendee.company && <span>{attendee.company}</span>}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            attendee.type === "internal"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {attendee.type === "internal" ? "내부" : "외부"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 안건 */}
              {meeting.agenda && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">안건</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {meeting.agenda}
                  </p>
                </div>
              )}

              {/* 논의 사항 */}
              {meeting.discussion && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">논의 사항</h3>
                  
                  {/* 비교표가 있으면 테이블로 표시 */}
                  {meeting.comparison_data && Object.keys(meeting.comparison_data).length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">콩골프//코코넛투어 비교표</h4>
                      <div className="overflow-x-auto bg-white rounded-lg border border-gray-300 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-blue-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                                항목
                              </th>
                              {Object.keys(meeting.comparison_data).map((company) => (
                                <th
                                  key={company}
                                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300 border-l"
                                >
                                  {company}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {(() => {
                              // 모든 회사에서 공통 항목 추출
                              const allKeys = new Set<string>();
                              Object.values(meeting.comparison_data).forEach((company: any) => {
                                if (typeof company === "object" && company !== null) {
                                  Object.keys(company).forEach((key) => allKeys.add(key));
                                }
                              });

                              return Array.from(allKeys).map((key, index) => (
                                <tr
                                  key={key}
                                  className={`hover:bg-gray-50 transition-colors ${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }`}
                                >
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap">
                                    {key}
                                  </td>
                                  {Object.keys(meeting.comparison_data).map((company) => (
                                    <td
                                      key={company}
                                      className="px-6 py-4 text-sm text-gray-700 border-l border-gray-200"
                                    >
                                      <div className="whitespace-pre-wrap break-words">
                                        {meeting.comparison_data[company]?.[key] || (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* 비교표가 없을 때만 원본 텍스트 표시 */}
                  {(!meeting.comparison_data || Object.keys(meeting.comparison_data).length === 0) && (
                    <div className="mt-6">
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {meeting.discussion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 결정 사항 */}
              {meeting.decisions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">결정 사항</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {meeting.decisions}
                  </p>
                </div>
              )}

              {/* 상세 정보 */}
              {meeting.details && Object.keys(meeting.details).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h3>
                  <div className="space-y-4">
                    {/* 호텔 정보 */}
                    {meeting.details.호텔 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">🏨</span>
                          호텔 정보
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {meeting.details.호텔.name && (
                            <div>
                              <span className="text-sm text-gray-500">호텔명</span>
                              <p className="font-medium text-gray-900">{meeting.details.호텔.name}</p>
                            </div>
                          )}
                          {meeting.details.호텔.rating && (
                            <div>
                              <span className="text-sm text-gray-500">등급</span>
                              <p className="font-medium text-gray-900">{meeting.details.호텔.rating}</p>
                            </div>
                          )}
                          {meeting.details.호텔.price_per_night && (
                            <div>
                              <span className="text-sm text-gray-500">1박 가격</span>
                              <p className="font-medium text-gray-900">{meeting.details.호텔.price_per_night}</p>
                            </div>
                          )}
                          {meeting.details.호텔.location && (
                            <div>
                              <span className="text-sm text-gray-500">위치</span>
                              <p className="font-medium text-gray-900">{meeting.details.호텔.location}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 골프장 정보 */}
                    {meeting.details.골프장 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">⛳</span>
                          골프장 정보
                        </h4>
                        <div className="space-y-3">
                          {meeting.details.골프장.total_courses && (
                            <div>
                              <span className="text-sm text-gray-500">예약 가능 골프장 수</span>
                              <p className="font-medium text-gray-900">{meeting.details.골프장.total_courses}개</p>
                            </div>
                          )}
                          {meeting.details.골프장.available_courses && Array.isArray(meeting.details.골프장.available_courses) && (
                            <div>
                              <span className="text-sm text-gray-500">주요 골프장</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {meeting.details.골프장.available_courses.map((course: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                  >
                                    {course}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {meeting.details.골프장.green_fee_weekday && (
                              <div>
                                <span className="text-sm text-gray-500">평일 그린피</span>
                                <p className="font-medium text-gray-900">{meeting.details.골프장.green_fee_weekday}</p>
                              </div>
                            )}
                            {meeting.details.골프장.green_fee_weekend && (
                              <div>
                                <span className="text-sm text-gray-500">주말 그린피</span>
                                <p className="font-medium text-gray-900">{meeting.details.골프장.green_fee_weekend}</p>
                              </div>
                            )}
                          </div>
                          {meeting.details.골프장.notes && (
                            <div>
                              <span className="text-sm text-gray-500">비고</span>
                              <p className="text-gray-700">{meeting.details.골프장.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 특이사항 */}
                    {meeting.details.특이사항 && Array.isArray(meeting.details.특이사항) && meeting.details.특이사항.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">📌</span>
                          특이사항
                        </h4>
                        <ul className="space-y-2">
                          {meeting.details.특이사항.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 기타 상세 정보 (동적 렌더링) */}
                    {Object.entries(meeting.details).map(([key, value]: [string, any]) => {
                      // 이미 처리한 키는 건너뛰기
                      if (["호텔", "골프장", "특이사항"].includes(key)) return null;
                      
                      return (
                        <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">{key}</h4>
                          {typeof value === "object" && value !== null && !Array.isArray(value) ? (
                            <div className="space-y-2">
                              {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                                <div key={subKey} className="flex">
                                  <span className="text-sm text-gray-500 w-32">{subKey}:</span>
                                  <span className="text-gray-900 flex-1">
                                    {Array.isArray(subValue) ? subValue.join(", ") : String(subValue)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : Array.isArray(value) ? (
                            <ul className="space-y-1">
                              {value.map((item: any, idx: number) => (
                                <li key={idx} className="text-gray-700">• {String(item)}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-700">{String(value)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 비교표 탭 */}
          {activeTab === "comparison" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">비교표</h3>
              {meeting.comparison_data && Object.keys(meeting.comparison_data).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                          항목
                        </th>
                        {Object.keys(meeting.comparison_data).map((company) => (
                          <th
                            key={company}
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-300 border-l"
                          >
                            {company}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        // 모든 회사에서 공통 항목 추출
                        const allKeys = new Set<string>();
                        Object.values(meeting.comparison_data).forEach((company: any) => {
                          if (typeof company === "object" && company !== null) {
                            Object.keys(company).forEach((key) => allKeys.add(key));
                          }
                        });

                        return Array.from(allKeys).map((key, index) => (
                        <tr
                          key={key}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap">
                            {key}
                          </td>
                          {Object.keys(meeting.comparison_data).map((company) => (
                            <td
                              key={company}
                              className="px-6 py-4 text-sm text-gray-700 border-l border-gray-200"
                            >
                              <div className="whitespace-pre-wrap break-words">
                                {meeting.comparison_data[company]?.[key] || (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-lg">비교표 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* Action Items 탭 */}
          {activeTab === "actions" && meeting.action_items && meeting.action_items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h3>
              <div className="space-y-3">
                {meeting.action_items.map((item: ActionItem, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{item.task}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {item.assignee && (
                            <span>담당자: {item.assignee}</span>
                          )}
                          {item.due_date && (
                            <span>
                              마감일: {new Date(item.due_date).toLocaleDateString("ko-KR")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : item.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {item.status === "completed" ? "완료" : item.status === "in_progress" ? "진행중" : "대기"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 첨부파일 탭 */}
          {activeTab === "attachments" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">첨부파일</h3>
              
              {/* 첨부파일 업로더 */}
              <div className="mb-6">
                <MeetingAttachmentUploader
                  meetingMinuteId={id}
                  existingAttachments={meeting.attachments || []}
                  onUploaded={() => {
                    fetchMeeting();
                  }}
                />
              </div>

              {/* 기존 첨부파일 목록 */}
              {meeting.attachments && meeting.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">업로드된 파일</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {meeting.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        {attachment.file_type?.startsWith("image/") ? (
                          <img
                            src={attachment.file_url}
                            alt={attachment.file_name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-sm text-gray-700 truncate mb-1">{attachment.file_name}</p>
                        {attachment.file_size && (
                          <p className="text-xs text-gray-500 mb-2">
                            {(attachment.file_size / 1024).toFixed(1)} KB
                          </p>
                        )}
                        <a
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 block"
                        >
                          다운로드
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


