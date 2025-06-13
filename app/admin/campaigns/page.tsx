"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Target, Play, Pause, CheckCircle, XCircle, 
  Calendar, Users, MessageSquare, TrendingUp,
  Plus, Edit2, Trash2, Eye, Filter
} from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  description?: string | null;
  target_query?: string | null;
  target_count?: number | null;
  template_id?: string | null;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  total_sent: number;
  total_delivered: number;
  total_read: number;
  total_clicked: number;
  total_cost: number;
  status: string;
  created_by?: string | null;
  created_at: string;
  template?: {
    id: string;
    name: string;
    type: string;
    content: string;
  };
};

type MessageTemplate = {
  id: string;
  name: string;
  type: string;
  content: string;
};

export default function CampaignManagementPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  
  // 캠페인 폼
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_id: "",
    target_query: "",
    scheduled_at: ""
  });

  // 대상자 미리보기
  const [targetPreview, setTargetPreview] = useState<any[]>([]);
  const [targetCount, setTargetCount] = useState(0);

  // 데이터 불러오기
  const fetchData = async () => {
    setLoading(true);
    try {
      // 캠페인 목록
      const { data: campaignData } = await supabase
        .from("marketing_campaigns")
        .select(`
          *,
          template:template_id (
            id,
            name,
            type,
            content
          )
        `)
        .order("created_at", { ascending: false });

      // 템플릿 목록
      const { data: templateData } = await supabase
        .from("message_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      setCampaigns(campaignData || []);
      setTemplates(templateData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 대상자 쿼리 실행
  const executeTargetQuery = async (query: string) => {
    try {
      // 기본 쿼리들
      const queries: Record<string, string> = {
        "all_agreed": `
          SELECT id, name, phone, email, last_tour_date, total_tour_count
          FROM customers 
          WHERE marketing_agreed = true AND status = 'active'
        `,
        "vip_customers": `
          SELECT id, name, phone, email, last_tour_date, total_tour_count
          FROM customers 
          WHERE customer_type = 'vip' AND marketing_agreed = true AND status = 'active'
        `,
        "recent_customers": `
          SELECT id, name, phone, email, last_tour_date, total_tour_count
          FROM customers 
          WHERE last_tour_date >= CURRENT_DATE - INTERVAL '6 months' 
          AND marketing_agreed = true AND status = 'active'
        `,
        "kakao_friends": `
          SELECT id, name, phone, email, last_tour_date, total_tour_count
          FROM customers 
          WHERE kakao_friend = true AND status = 'active'
        `
      };

      const selectedQuery = queries[query] || query;
      
      // RPC 함수를 통해 안전하게 쿼리 실행
      const { data, error } = await supabase.rpc('execute_campaign_query', {
        query_text: selectedQuery
      });

      if (error) throw error;

      setTargetPreview(data || []);
      setTargetCount(data?.length || 0);
    } catch (error) {
      console.error("Error executing query:", error);
      setTargetPreview([]);
      setTargetCount(0);
    }
  };

  // 캠페인 저장
  const saveCampaign = async () => {
    try {
      if (!formData.name || !formData.template_id || !formData.target_query) {
        alert("필수 항목을 모두 입력하세요.");
        return;
      }

      const campaignData = {
        ...formData,
        target_count: targetCount,
        status: formData.scheduled_at ? "scheduled" : "draft"
      };

      if (editingCampaign) {
        // 수정
        await supabase
          .from("marketing_campaigns")
          .update(campaignData)
          .eq("id", editingCampaign.id);
      } else {
        // 추가
        await supabase
          .from("marketing_campaigns")
          .insert(campaignData);
      }

      alert("캠페인이 저장되었습니다.");
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("캠페인 저장 중 오류가 발생했습니다.");
    }
  };

  // 캠페인 실행
  const executeCampaign = async (campaign: Campaign) => {
    if (!confirm(`'${campaign.name}' 캠페인을 실행하시겠습니까?\n${campaign.target_count}명에게 메시지가 발송됩니다.`)) {
      return;
    }

    try {
      // 상태를 running으로 변경
      await supabase
        .from("marketing_campaigns")
        .update({ 
          status: "running",
          started_at: new Date().toISOString()
        })
        .eq("id", campaign.id);

      // 실제 발송은 백그라운드 작업으로 처리
      alert("캠페인이 시작되었습니다. 발송 진행 상황은 잠시 후 확인하세요.");
      fetchData();
    } catch (error) {
      console.error("Error executing campaign:", error);
      alert("캠페인 실행 중 오류가 발생했습니다.");
    }
  };

  // 캠페인 삭제
  const deleteCampaign = async (id: string) => {
    if (!confirm("캠페인을 삭제하시겠습니까?")) return;

    try {
      await supabase
        .from("marketing_campaigns")
        .delete()
        .eq("id", id);

      alert("캠페인이 삭제되었습니다.");
      fetchData();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      alert("캠페인 삭제 중 오류가 발생했습니다.");
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      template_id: "",
      target_query: "",
      scheduled_at: ""
    });
    setTargetPreview([]);
    setTargetCount(0);
    setEditingCampaign(null);
  };

  // 상태 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit2 className="w-4 h-4 text-gray-500" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "running":
        return <Play className="w-4 h-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // 필터링된 캠페인
  const filteredCampaigns = filterStatus 
    ? campaigns.filter(c => c.status === filterStatus)
    : campaigns;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">마케팅 캠페인</h1>
        <p className="text-gray-600 mt-1">고객 세그먼트별 대량 메시지 발송 관리</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 캠페인</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">진행중</p>
              <p className="text-2xl font-bold text-yellow-600">
                {campaigns.filter(c => c.status === "running").length}
              </p>
            </div>
            <Play className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">이번달 발송</p>
              <p className="text-2xl font-bold text-green-600">
                {campaigns.reduce((sum, c) => sum + c.total_sent, 0).toLocaleString()}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 비용</p>
              <p className="text-2xl font-bold text-purple-600">
                {campaigns.reduce((sum, c) => sum + c.total_cost, 0).toLocaleString()}원
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 필터 및 액션 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 상태</option>
              <option value="draft">초안</option>
              <option value="scheduled">예약</option>
              <option value="running">진행중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            캠페인 생성
          </button>
        </div>
      </div>

      {/* 캠페인 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  캠페인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  템플릿
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대상
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결과
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map(campaign => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.description}</div>
                      {campaign.scheduled_at && (
                        <div className="text-xs text-blue-600 mt-1">
                          예약: {new Date(campaign.scheduled_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {campaign.template?.name || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {campaign.template?.type || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {campaign.target_count?.toLocaleString() || 0}명
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      <span className={`text-sm font-medium
                        ${campaign.status === 'completed' ? 'text-green-600' :
                          campaign.status === 'running' ? 'text-yellow-600' :
                          campaign.status === 'cancelled' ? 'text-red-600' :
                          campaign.status === 'scheduled' ? 'text-blue-600' :
                          'text-gray-600'}`}>
                        {campaign.status === 'draft' ? '초안' :
                         campaign.status === 'scheduled' ? '예약' :
                         campaign.status === 'running' ? '진행중' :
                         campaign.status === 'completed' ? '완료' :
                         campaign.status === 'cancelled' ? '취소' : campaign.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {campaign.status === 'completed' || campaign.status === 'running' ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">발송:</span>
                          <span className="font-medium">{campaign.total_sent}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>수신: {campaign.total_delivered}</span>
                          <span>읽음: {campaign.total_read}</span>
                        </div>
                        {campaign.total_cost > 0 && (
                          <div className="text-xs text-gray-600 mt-1">
                            비용: {campaign.total_cost.toLocaleString()}원
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {campaign.status === 'draft' && (
                        <>
                          <button
                            onClick={() => executeCampaign(campaign)}
                            className="text-green-600 hover:text-green-900"
                            title="실행"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCampaign(campaign);
                              setFormData({
                                name: campaign.name,
                                description: campaign.description || "",
                                template_id: campaign.template_id || "",
                                target_query: campaign.target_query || "",
                                scheduled_at: campaign.scheduled_at || ""
                              });
                              setTargetCount(campaign.target_count || 0);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-900"
                        title="삭제"
                        disabled={campaign.status === 'running'}
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
      )}

      {/* 캠페인 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCampaign ? "캠페인 수정" : "캠페인 생성"}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">기본 정보</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    캠페인 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 2025년 봄 시즌 프로모션"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="캠페인 목적 및 내용"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    메시지 템플릿 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.template_id}
                    onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">템플릿 선택</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    예약 발송 (선택)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    비워두면 수동으로 실행합니다
                  </p>
                </div>
              </div>

              {/* 대상자 선택 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">
                  대상자 선택
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({targetCount}명)
                  </span>
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대상자 그룹 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.target_query}
                    onChange={(e) => {
                      setFormData({ ...formData, target_query: e.target.value });
                      if (e.target.value) {
                        executeTargetQuery(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="all_agreed">마케팅 동의 고객 전체</option>
                    <option value="vip_customers">VIP 고객</option>
                    <option value="recent_customers">최근 6개월 이내 참여 고객</option>
                    <option value="kakao_friends">카카오 친구 추가 고객</option>
                  </select>
                </div>

                {/* 대상자 미리보기 */}
                {targetPreview.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      대상자 미리보기 (상위 10명)
                    </h4>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">이름</th>
                            <th className="px-3 py-2 text-left">전화번호</th>
                            <th className="px-3 py-2 text-left">투어횟수</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {targetPreview.slice(0, 10).map((customer, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">{customer.name}</td>
                              <td className="px-3 py-2">{customer.phone}</td>
                              <td className="px-3 py-2">{customer.total_tour_count}회</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveCampaign}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCampaign ? "수정" : "생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
