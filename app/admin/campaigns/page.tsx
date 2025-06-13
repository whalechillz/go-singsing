"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Send, Calendar, Clock, Users, Target, BarChart, 
  Plus, Edit2, Trash2, Play, Pause, Settings,
  Gift, Cake, Heart, AlertCircle, Zap, TestTube
} from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  description?: string;
  target_segment?: any;
  message_template_id?: string;
  scheduled_at?: string;
  sent_at?: string;
  status: string;
  recipients_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  cost: number;
  is_automated?: boolean;
  automation_type?: string;
  automation_config?: any;
  next_run_at?: string;
  last_run_at?: string;
  run_count?: number;
  created_at: string;
  message_template?: {
    id: string;
    name: string;
    type: string;
    content: string;
  };
};

type CampaignVariant = {
  id: string;
  campaign_id: string;
  variant_name: string;
  message_template_id?: string;
  send_time?: string;
  percentage: number;
  metrics: {
    sent: number;
    delivered: number;
    clicked: number;
    converted: number;
  };
};

export default function CampaignManagementPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showABTestModal, setShowABTestModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  
  // 캠페인 폼
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    message_template_id: "",
    scheduled_at: "",
    target_segment: {
      customer_type: "",
      tags: [] as string[],
      marketing_agreed: true,
      min_tour_count: 0,
      max_tour_count: null as number | null,
      last_tour_days: null as number | null
    }
  });

  // 자동화 설정
  const [automationData, setAutomationData] = useState({
    is_automated: false,
    automation_type: "birthday",
    automation_config: {
      days_before: 0,
      days_after: 0,
      send_time: "09:00",
      repeat_interval: "none"
    }
  });

  // A/B 테스트 설정
  const [abTestData, setAbTestData] = useState({
    enabled: false,
    variants: [
      { variant_name: "A", message_template_id: "", percentage: 50 },
      { variant_name: "B", message_template_id: "", percentage: 50 }
    ]
  });

  // 데이터 불러오기
  const fetchData = async () => {
    setLoading(true);
    try {
      // 캠페인 목록
      const { data: campaignData } = await supabase
        .from("marketing_campaigns")
        .select(`
          *,
          message_template:message_template_id (
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

  // 캠페인 저장
  const saveCampaign = async () => {
    try {
      if (!formData.name || !formData.message_template_id) {
        alert("캠페인 이름과 메시지 템플릿을 선택하세요.");
        return;
      }

      const campaignData: any = {
        ...formData,
        ...automationData,
        status: formData.scheduled_at ? "scheduled" : "draft"
      };

      let campaignId;

      if (editingCampaign) {
        // 수정
        const { data, error } = await supabase
          .from("marketing_campaigns")
          .update(campaignData)
          .eq("id", editingCampaign.id)
          .select()
          .single();

        if (error) throw error;
        campaignId = data.id;
      } else {
        // 추가
        const { data, error } = await supabase
          .from("marketing_campaigns")
          .insert(campaignData)
          .select()
          .single();

        if (error) throw error;
        campaignId = data.id;
      }

      // A/B 테스트 설정 저장
      if (abTestData.enabled && campaignId) {
        // 기존 변형 삭제
        await supabase
          .from("campaign_variants")
          .delete()
          .eq("campaign_id", campaignId);

        // 새 변형 추가
        const variants = abTestData.variants.map(v => ({
          campaign_id: campaignId,
          ...v
        }));

        await supabase
          .from("campaign_variants")
          .insert(variants);
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
    if (!confirm(`'${campaign.name}' 캠페인을 실행하시겠습니까?`)) return;

    try {
      // 대상 고객 조회
      let query = supabase
        .from("customers")
        .select("*")
        .eq("status", "active");

      // 세그먼트 필터 적용
      if (campaign.target_segment) {
        const segment = campaign.target_segment;
        
        if (segment.customer_type) {
          query = query.eq("customer_type", segment.customer_type);
        }
        if (segment.marketing_agreed) {
          query = query.eq("marketing_agreed", true);
        }
        if (segment.tags && segment.tags.length > 0) {
          query = query.contains("tags", segment.tags);
        }
        if (segment.min_tour_count > 0) {
          query = query.gte("total_tour_count", segment.min_tour_count);
        }
        if (segment.max_tour_count) {
          query = query.lte("total_tour_count", segment.max_tour_count);
        }
      }

      const { data: customers, error } = await query;
      if (error) throw error;

      if (!customers || customers.length === 0) {
        alert("대상 고객이 없습니다.");
        return;
      }

      // 메시지 발송 API 호출
      const response = await fetch("/api/aligo/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: campaign.message_template?.type || "sms",
          recipients: customers.map(c => ({
            phone: c.phone,
            customer_id: c.id
          })),
          content: campaign.message_template?.content,
          template_id: campaign.message_template_id,
          variables: [] // 캠페인별 추가 변수
        })
      });

      if (!response.ok) throw new Error("발송 실패");

      const result = await response.json();

      // 캠페인 상태 업데이트
      await supabase
        .from("marketing_campaigns")
        .update({
          status: "completed",
          sent_at: new Date().toISOString(),
          recipients_count: customers.length,
          sent_count: result.sent,
          failed_count: result.failed,
          cost: result.cost
        })
        .eq("id", campaign.id);

      alert(`캠페인이 실행되었습니다. ${result.sent}명 발송, ${result.failed}명 실패`);
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
      message_template_id: "",
      scheduled_at: "",
      target_segment: {
        customer_type: "",
        tags: [],
        marketing_agreed: true,
        min_tour_count: 0,
        max_tour_count: null,
        last_tour_days: null
      }
    });
    setAutomationData({
      is_automated: false,
      automation_type: "birthday",
      automation_config: {
        days_before: 0,
        days_after: 0,
        send_time: "09:00",
        repeat_interval: "none"
      }
    });
    setAbTestData({
      enabled: false,
      variants: [
        { variant_name: "A", message_template_id: "", percentage: 50 },
        { variant_name: "B", message_template_id: "", percentage: 50 }
      ]
    });
    setEditingCampaign(null);
  };

  // 자동화 아이콘
  const getAutomationIcon = (type: string) => {
    switch (type) {
      case "birthday": return <Cake className="w-4 h-4" />;
      case "anniversary": return <Heart className="w-4 h-4" />;
      case "after_tour": return <Gift className="w-4 h-4" />;
      case "inactive_reminder": return <AlertCircle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  // 상태 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "running": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">마케팅 캠페인</h1>
        <p className="text-gray-600 mt-1">고객 세그먼트별 타겟 마케팅과 자동화 캠페인을 관리합니다.</p>
      </div>

      {/* 액션 버튼 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          일반 캠페인
        </button>
        <button
          onClick={() => {
            resetForm();
            setShowAutomationModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Zap className="w-5 h-5" />
          자동화 캠페인
        </button>
        <button
          onClick={() => {
            resetForm();
            setShowABTestModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <TestTube className="w-5 h-5" />
          A/B 테스트
        </button>
      </div>

      {/* 캠페인 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status === "draft" ? "초안" :
                       campaign.status === "scheduled" ? "예약됨" :
                       campaign.status === "running" ? "실행중" :
                       campaign.status === "completed" ? "완료" : "실패"}
                    </span>
                    {campaign.is_automated && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {getAutomationIcon(campaign.automation_type || "")}
                        <span>자동화</span>
                      </div>
                    )}
                  </div>
                  
                  {campaign.description && (
                    <p className="text-gray-600 mb-2">{campaign.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">대상자</p>
                      <p className="font-medium">{campaign.recipients_count || 0}명</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">발송</p>
                      <p className="font-medium">{campaign.sent_count || 0}명</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">성공률</p>
                      <p className="font-medium">
                        {campaign.sent_count > 0 
                          ? `${((campaign.delivered_count / campaign.sent_count) * 100).toFixed(1)}%`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">비용</p>
                      <p className="font-medium">{campaign.cost?.toLocaleString() || 0}원</p>
                    </div>
                  </div>

                  {campaign.is_automated && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>실행 횟수: {campaign.run_count || 0}회</span>
                      {campaign.last_run_at && (
                        <span>마지막 실행: {new Date(campaign.last_run_at).toLocaleString()}</span>
                      )}
                      {campaign.next_run_at && (
                        <span>다음 실행: {new Date(campaign.next_run_at).toLocaleString()}</span>
                      )}
                    </div>
                  )}

                  {campaign.scheduled_at && campaign.status === "scheduled" && (
                    <p className="text-sm text-gray-600">
                      예약: {new Date(campaign.scheduled_at).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {campaign.status === "draft" && (
                    <>
                      <button
                        onClick={() => executeCampaign(campaign)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="캠페인 실행"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setFormData({
                            name: campaign.name,
                            description: campaign.description || "",
                            message_template_id: campaign.message_template_id || "",
                            scheduled_at: campaign.scheduled_at || "",
                            target_segment: campaign.target_segment || {
                              customer_type: "",
                              tags: [],
                              marketing_agreed: true,
                              min_tour_count: 0,
                              max_tour_count: null,
                              last_tour_days: null
                            }
                          });
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {campaign.is_automated && campaign.status === "running" && (
                    <button
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="일시정지"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 일반 캠페인 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCampaign ? "캠페인 수정" : "캠페인 생성"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  캠페인 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 2024년 봄 시즌 프로모션"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="캠페인 목적과 내용을 간단히 설명하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메시지 템플릿 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.message_template_id}
                  onChange={(e) => setFormData({ ...formData, message_template_id: e.target.value })}
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
              </div>

              {/* 타겟 세그먼트 설정 */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">대상 고객 설정</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      고객 유형
                    </label>
                    <select
                      value={formData.target_segment.customer_type}
                      onChange={(e) => setFormData({
                        ...formData,
                        target_segment: {
                          ...formData.target_segment,
                          customer_type: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">전체</option>
                      <option value="vip">VIP</option>
                      <option value="regular">일반</option>
                      <option value="new">신규</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      최소 투어 참여 횟수
                    </label>
                    <input
                      type="number"
                      value={formData.target_segment.min_tour_count}
                      onChange={(e) => setFormData({
                        ...formData,
                        target_segment: {
                          ...formData.target_segment,
                          min_tour_count: parseInt(e.target.value) || 0
                        }
                      })}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.target_segment.marketing_agreed}
                      onChange={(e) => setFormData({
                        ...formData,
                        target_segment: {
                          ...formData.target_segment,
                          marketing_agreed: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">마케팅 수신 동의 고객만</span>
                  </label>
                </div>
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

      {/* 자동화 캠페인 설정 모달 */}
      {showAutomationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">자동화 캠페인 설정</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  자동화 유형
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAutomationData({
                      ...automationData,
                      automation_type: "birthday"
                    })}
                    className={`p-4 border rounded-lg text-center hover:bg-gray-50 ${
                      automationData.automation_type === "birthday" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-300"
                    }`}
                  >
                    <Cake className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="font-medium">생일 축하</p>
                    <p className="text-xs text-gray-500 mt-1">
                      고객 생일에 자동 발송
                    </p>
                  </button>

                  <button
                    onClick={() => setAutomationData({
                      ...automationData,
                      automation_type: "after_tour"
                    })}
                    className={`p-4 border rounded-lg text-center hover:bg-gray-50 ${
                      automationData.automation_type === "after_tour" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-300"
                    }`}
                  >
                    <Gift className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-medium">투어 후 감사</p>
                    <p className="text-xs text-gray-500 mt-1">
                      투어 종료 후 자동 발송
                    </p>
                  </button>

                  <button
                    onClick={() => setAutomationData({
                      ...automationData,
                      automation_type: "anniversary"
                    })}
                    className={`p-4 border rounded-lg text-center hover:bg-gray-50 ${
                      automationData.automation_type === "anniversary" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-300"
                    }`}
                  >
                    <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <p className="font-medium">가입 기념일</p>
                    <p className="text-xs text-gray-500 mt-1">
                      가입 1주년 등 기념일
                    </p>
                  </button>

                  <button
                    onClick={() => setAutomationData({
                      ...automationData,
                      automation_type: "inactive_reminder"
                    })}
                    className={`p-4 border rounded-lg text-center hover:bg-gray-50 ${
                      automationData.automation_type === "inactive_reminder" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-300"
                    }`}
                  >
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <p className="font-medium">휴면 고객</p>
                    <p className="text-xs text-gray-500 mt-1">
                      일정 기간 미참여 고객
                    </p>
                  </button>
                </div>
              </div>

              {/* 자동화 타입별 설정 */}
              {automationData.automation_type === "birthday" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      발송 시점
                    </label>
                    <select
                      value={automationData.automation_config.days_before}
                      onChange={(e) => setAutomationData({
                        ...automationData,
                        automation_config: {
                          ...automationData.automation_config,
                          days_before: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">생일 당일</option>
                      <option value="1">생일 1일 전</option>
                      <option value="3">생일 3일 전</option>
                      <option value="7">생일 1주일 전</option>
                    </select>
                  </div>
                </div>
              )}

              {automationData.automation_type === "after_tour" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      발송 시점
                    </label>
                    <select
                      value={automationData.automation_config.days_after}
                      onChange={(e) => setAutomationData({
                        ...automationData,
                        automation_config: {
                          ...automationData.automation_config,
                          days_after: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">투어 종료 1일 후</option>
                      <option value="3">투어 종료 3일 후</option>
                      <option value="7">투어 종료 1주일 후</option>
                      <option value="14">투어 종료 2주 후</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  발송 시간
                </label>
                <input
                  type="time"
                  value={automationData.automation_config.send_time}
                  onChange={(e) => setAutomationData({
                    ...automationData,
                    automation_config: {
                      ...automationData.automation_config,
                      send_time: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  캠페인 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`예: ${
                    automationData.automation_type === "birthday" ? "생일 축하 자동 발송" :
                    automationData.automation_type === "after_tour" ? "투어 후 감사 메시지" :
                    automationData.automation_type === "anniversary" ? "가입 1주년 축하" :
                    "휴면 고객 리마인더"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메시지 템플릿 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.message_template_id}
                  onChange={(e) => setFormData({ ...formData, message_template_id: e.target.value })}
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
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAutomationModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setAutomationData({ ...automationData, is_automated: true });
                  saveCampaign();
                  setShowAutomationModal(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A/B 테스트 모달 */}
      {showABTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">A/B 테스트 캠페인</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  캠페인 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 프로모션 메시지 A/B 테스트"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">테스트 변형</h3>
                
                {abTestData.variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">변형 {variant.variant_name}</h4>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">비율:</label>
                        <input
                          type="number"
                          value={variant.percentage}
                          onChange={(e) => {
                            const newVariants = [...abTestData.variants];
                            newVariants[index].percentage = parseInt(e.target.value) || 0;
                            setAbTestData({ ...abTestData, variants: newVariants });
                          }}
                          min="0"
                          max="100"
                          className="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        메시지 템플릿
                      </label>
                      <select
                        value={variant.message_template_id}
                        onChange={(e) => {
                          const newVariants = [...abTestData.variants];
                          newVariants[index].message_template_id = e.target.value;
                          setAbTestData({ ...abTestData, variants: newVariants });
                        }}
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
                  </div>
                ))}
                
                <p className="text-sm text-gray-500">
                  총 비율: {abTestData.variants.reduce((sum, v) => sum + v.percentage, 0)}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예약 발송
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowABTestModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setAbTestData({ ...abTestData, enabled: true });
                  saveCampaign();
                  setShowABTestModal(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={abTestData.variants.reduce((sum, v) => sum + v.percentage, 0) !== 100}
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
