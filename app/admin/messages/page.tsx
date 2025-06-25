"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Send, MessageSquare, Clock, CheckCircle, XCircle, 
  AlertTriangle, Filter, Search, Plus, Edit2, Trash2,
  Phone, User, Calendar, FileText, Eye, X, BookOpen,
  Upload, Image as ImageIcon
} from "lucide-react";
import TemplatePicker from '@/components/TemplatePicker';
import MmsImageUpload from '@/components/MmsImageUpload';

type Customer = {
  id: string;
  name: string;
  phone: string;
  marketing_agreed: boolean;
  kakao_friend: boolean;
};

type MessageTemplate = {
  id: string;
  name: string;
  type: string; // sms, lms, mms, kakao_alimtalk
  title?: string | null;
  content: string;
  variables?: any;
  buttons?: any;
  kakao_template_code?: string | null;
  is_active: boolean;
  created_at: string;
};

type MessageLog = {
  id: string;
  customer_id?: string | null;
  message_type: string;
  phone_number: string;
  title?: string | null;
  content: string;
  status: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  cost?: number | null;
  created_at: string;
  customer?: Customer;
};

export default function MessageManagementPage() {
  const [activeTab, setActiveTab] = useState<"send" | "templates" | "history">("send");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 발송 폼
  const [messageType, setMessageType] = useState<string>("sms");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [directPhone, setDirectPhone] = useState("");
  const [messageImage, setMessageImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // 템플릿 모달
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "sms",
    title: "",
    content: "",
    kakao_template_code: "",
    is_active: true
  });

  // 미리보기 모달
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewPhone, setPreviewPhone] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [showNoticePicker, setShowNoticePicker] = useState(false);

  // 발송 이력 필터
  const [filterDateRange, setFilterDateRange] = useState<"today" | "week" | "month" | "all">("week");
  const [filterMessageType, setFilterMessageType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchPhone, setSearchPhone] = useState("");

  // 메시지 타입 변경 시 SMS면 제목 제거
  useEffect(() => {
    if (messageType === "sms") {
      setMessageTitle("");
    }
  }, [messageType]);

  // 데이터 불러오기
  const fetchData = async () => {
    setLoading(true);
    try {
      // 고객 목록 (마케팅 동의한 고객만)
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("marketing_agreed", true)
        .eq("status", "active")
        .order("name");

      // 템플릿 목록
      const { data: templateData } = await supabase
        .from("message_templates")
        .select("*")
        .order("created_at", { ascending: false });

      setCustomers(customerData || []);
      setTemplates(templateData || []);
      
      // 발송 이력은 별도로 불러오기
      fetchMessageLogs();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 발송 이력 불러오기
  const fetchMessageLogs = async () => {
    try {
      let query = supabase
        .from("message_logs")
        .select(`
          *,
          customer:customer_id (
            id,
            name,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      // 날짜 필터
      const now = new Date();
      if (filterDateRange === "today") {
        const today = new Date(now.setHours(0, 0, 0, 0));
        query = query.gte("created_at", today.toISOString());
      } else if (filterDateRange === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (filterDateRange === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        query = query.gte("created_at", monthAgo.toISOString());
      }

      // 메시지 타입 필터
      if (filterMessageType) {
        query = query.eq("message_type", filterMessageType);
      }

      // 상태 필터
      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }

      const { data: logData } = await query.limit(100);

      // 전화번호 검색 필터
      let filteredLogs = logData || [];
      if (searchPhone) {
        filteredLogs = filteredLogs.filter(log => 
          log.phone_number.includes(searchPhone.replace(/-/g, ""))
        );
      }

      setMessageLogs(filteredLogs);
    } catch (error) {
      console.error("Error fetching message logs:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchMessageLogs();
    }
  }, [filterDateRange, filterMessageType, filterStatus, searchPhone, activeTab]);

  // 템플릿 선택 시 내용 자동 입력
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setMessageContent(template.content);
        setMessageType(template.type);
        // 템플릿 타입에 따라 제목 설정
        if (template.type !== "sms") {
          setMessageTitle(template.title || "");
        } else {
          setMessageTitle(""); // SMS는 제목 없음
        }
      }
    }
  }, [selectedTemplate, templates]);

  // 미리보기 표시
  const showPreview = () => {
    if (!messageContent.trim()) {
      alert("메시지 내용을 입력하세요.");
      return;
    }

    // 샘플 변수 치환
    let preview = messageContent;
    preview = preview.replace(/#{이름}/g, "홍길동");
    preview = preview.replace(/#{투어명}/g, "제주도 3일 골프투어");
    preview = preview.replace(/#{출발일}/g, "2024년 3월 15일");
    preview = preview.replace(/#{결제금액}/g, "1,500,000원");

    setPreviewContent(preview);
    setPreviewTitle(messageTitle);
    setPreviewPhone(directPhone || "010-1234-5678");
    setPreviewImage(messageType === "mms" ? messageImage : "");
    setShowPreviewModal(true);
  };

  // 메시지 발송
  const sendMessage = async () => {
    try {
      if (!messageContent.trim()) {
        alert("메시지 내용을 입력하세요.");
        return;
      }

      // 수신자 확인
      let recipients: { phone: string; customer_id?: string }[] = [];
      
      if (directPhone) {
        // 직접 입력한 번호 (쉼표로 구분된 다중 번호 지원)
        const phones = directPhone.split(',').map(p => p.trim()).filter(p => p);
        phones.forEach(phone => {
          recipients.push({ phone });
        });
      } else if (selectedCustomers.length > 0) {
        // 선택한 고객들
        const selectedCustomerData = customers.filter(c => selectedCustomers.includes(c.id));
        recipients = selectedCustomerData.map(c => ({ 
          phone: c.phone, 
          customer_id: c.id 
        }));
      }

      if (recipients.length === 0) {
        alert("수신자를 선택하거나 전화번호를 입력하세요.");
        return;
      }

      // 발송 확인
      if (!confirm(`${recipients.length}명에게 메시지를 발송하시겠습니까?`)) {
        return;
      }

      // 솔라피 API 호출 (실제로는 서버 API를 통해 호출)
      const response = await fetch("/api/solapi/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: messageType,
          recipients,
          title: messageType !== "sms" ? messageTitle : "", // SMS는 제목 없음
          content: messageContent,
          template_id: selectedTemplate || null,
          image_url: messageType === "mms" ? messageImage : null
        })
      });

      const result = await response.json();
      console.log("발송 응답:", result);
      
      if (!response.ok) {
        console.error("발송 실패 상세:", result);
        alert(`메시지 발송 실패: ${result.message || "알 수 없는 오류"}`);
        return;
      }

      alert(`${result.sent}명 발송 성공, ${result.failed}명 발송 실패`);
      
      // 폼 초기화
      setSelectedCustomers([]);
      setDirectPhone("");
      setMessageContent("");
      setMessageTitle("");
      setSelectedTemplate("");
      setMessageImage("");
      
      // 이력 새로고침
      fetchData();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("메시지 발송 중 오류가 발생했습니다.");
    }
  };

  // 템플릿 저장
  const saveTemplate = async () => {
    try {
      if (!templateForm.name || !templateForm.content) {
        alert("템플릿 이름과 내용을 입력하세요.");
        return;
      }

      if (editingTemplate) {
        // 수정
        await supabase
          .from("message_templates")
          .update({
            ...templateForm,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingTemplate.id);
      } else {
        // 추가
        await supabase
          .from("message_templates")
          .insert(templateForm);
      }

      alert("템플릿이 저장되었습니다.");
      setShowTemplateModal(false);
      resetTemplateForm();
      fetchData();
    } catch (error) {
      console.error("Error saving template:", error);
      alert("템플릿 저장 중 오류가 발생했습니다.");
    }
  };

  // 템플릿 삭제
  const deleteTemplate = async (id: string) => {
    if (!confirm("템플릿을 삭제하시겠습니까?")) return;

    try {
      await supabase
        .from("message_templates")
        .delete()
        .eq("id", id);

      alert("템플릿이 삭제되었습니다.");
      fetchData();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("템플릿 삭제 중 오류가 발생했습니다.");
    }
  };

  // 템플릿 폼 초기화
  const resetTemplateForm = () => {
    setTemplateForm({
      name: "",
      type: "sms",
      title: "",
      content: "",
      kakao_template_code: "",
      is_active: true
    });
    setEditingTemplate(null);
  };

  // 발송 상태 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // 메시지 타입 라벨
  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case "sms": return "SMS";
      case "lms": return "LMS";
      case "mms": return "MMS";
      case "kakao_alimtalk": return "카카오 알림톡";
      default: return type;
    }
  };

  // 바이트 계산 함수
  const getByteLength = (str: string) => {
    let bytes = 0;
    for (let i = 0; i < str.length; i++) {
      bytes += str.charCodeAt(i) > 127 ? 2 : 1;
    }
    return bytes;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">메시지 발송</h1>
        <p className="text-gray-600 mt-1">솔라피를 통한 SMS, 카카오톡 발송 관리</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("send")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "send"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          메시지 발송
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "templates"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          템플릿 관리
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "history"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          발송 이력
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* 메시지 발송 탭 */}
          {activeTab === "send" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 발송 설정 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">발송 설정</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      메시지 유형
                    </label>
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sms">SMS (90바이트)</option>
                      <option value="lms">LMS (2000바이트)</option>
                      <option value="mms">MMS (이미지포함)</option>
                      <option value="kakao_alimtalk">카카오 알림톡</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      템플릿 선택
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">직접 입력</option>
                      {templates
                        .filter(t => t.type === messageType && t.is_active)
                        .map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {(messageType === "lms" || messageType === "mms") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        제목
                      </label>
                      <input
                        type="text"
                        value={messageTitle}
                        onChange={(e) => setMessageTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="메시지 제목"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      메시지 내용
                    </label>
                    <div className="relative">
                      <textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="메시지 내용을 입력하세요"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNoticePicker(true)}
                        className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <BookOpen className="w-4 h-4" />
                        공지 템플릿
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        {getByteLength(messageContent)}바이트 / 
                        {messageType === "sms" ? " 90" : messageType === "lms" ? " 2000" : " 2000"}바이트
                      </p>
                      <button
                        onClick={showPreview}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        미리보기
                      </button>
                    </div>
                  </div>

                  {messageType === "mms" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이미지 첨부
                      </label>
                      <MmsImageUpload
                        imageUrl={messageImage}
                        onImageChange={setMessageImage}
                        isUploading={uploadingImage}
                        onUploadingChange={setUploadingImage}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      직접 입력 (전화번호)
                    </label>
                    <input
                      type="tel"
                      value={directPhone}
                      onChange={(e) => setDirectPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="010-0000-0000, 010-1111-1111 (쉼표로 구분하여 여러 번호 입력 가능)"
                    />
                  </div>
                </div>

                <button
                  onClick={sendMessage}
                  className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  메시지 발송
                </button>
              </div>

              {/* 수신자 선택 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  수신자 선택 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({selectedCustomers.length}명 선택)
                  </span>
                </h2>
                
                <div className="mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCustomers(customers.map(c => c.id))}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      전체 선택
                    </button>
                    <button
                      onClick={() => setSelectedCustomers([])}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      선택 해제
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {customers.map(customer => (
                    <label
                      key={customer.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id]);
                          } else {
                            setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{customer.name}</span>
                          <span className="text-sm text-gray-500">{customer.phone}</span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          {customer.marketing_agreed && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              마케팅 동의
                            </span>
                          )}
                          {customer.kakao_friend && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                              카카오 친구
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 템플릿 관리 탭 */}
          {activeTab === "templates" && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">템플릿 목록</h2>
                <button
                  onClick={() => {
                    resetTemplateForm();
                    setShowTemplateModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  템플릿 추가
                </button>
              </div>

              <div className="divide-y">
                {templates.map(template => (
                  <div key={template.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            template.type === "kakao_alimtalk" 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {getMessageTypeLabel(template.type)}
                          </span>
                          {!template.is_active && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              비활성
                            </span>
                          )}
                        </div>
                        {template.title && (
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            제목: {template.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {template.content}
                        </p>
                        {template.kakao_template_code && (
                          <p className="text-xs text-gray-500 mt-2">
                            카카오 템플릿 코드: {template.kakao_template_code}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setTemplateForm({
                              name: template.name,
                              type: template.type,
                              title: template.title || "",
                              content: template.content,
                              kakao_template_code: template.kakao_template_code || "",
                              is_active: template.is_active
                            });
                            setShowTemplateModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 발송 이력 탭 */}
          {activeTab === "history" && (
            <div>
              {/* 필터 */}
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="today">오늘</option>
                    <option value="week">최근 1주일</option>
                    <option value="month">최근 1개월</option>
                    <option value="all">전체</option>
                  </select>

                  <select
                    value={filterMessageType}
                    onChange={(e) => setFilterMessageType(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">전체 유형</option>
                    <option value="sms">SMS</option>
                    <option value="lms">LMS</option>
                    <option value="mms">MMS</option>
                    <option value="kakao_alimtalk">카카오 알림톡</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">전체 상태</option>
                    <option value="sent">발송완료</option>
                    <option value="delivered">수신확인</option>
                    <option value="failed">발송실패</option>
                  </select>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="전화번호 검색"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 이력 테이블 */}
              <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          발송일시
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          수신자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          유형
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          내용
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          비용
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {messageLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {log.customer?.name || "직접입력"}
                              </div>
                              <div className="text-gray-500">{log.phone_number}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              log.message_type === "kakao_alimtalk" 
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {getMessageTypeLabel(log.message_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              {log.title && <div className="font-medium">{log.title}</div>}
                              <div className="text-gray-600 truncate">{log.content}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="text-sm text-gray-600">
                                {log.status === "sent" ? "발송완료" :
                                 log.status === "delivered" ? "수신확인" :
                                 log.status === "failed" ? "발송실패" : "대기중"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.cost ? `${log.cost}원` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 템플릿 추가/수정 모달 */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingTemplate ? "템플릿 수정" : "템플릿 추가"}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    템플릿 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 투어 확정 안내"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    메시지 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sms">SMS</option>
                    <option value="lms">LMS</option>
                    <option value="mms">MMS</option>
                    <option value="kakao_alimtalk">카카오 알림톡</option>
                  </select>
                </div>
              </div>

              {(templateForm.type === "lms" || templateForm.type === "mms") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목
                  </label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="메시지 제목"
                  />
                </div>
              )}

              {templateForm.type === "kakao_alimtalk" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카카오 템플릿 코드
                  </label>
                  <input
                    type="text"
                    value={templateForm.kakao_template_code}
                    onChange={(e) => setTemplateForm({ ...templateForm, kakao_template_code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="솔라피에서 발급받은 템플릿 코드"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메시지 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="메시지 내용을 입력하세요. 변수는 #{변수명} 형식으로 입력하세요."
                />
                <p className="text-xs text-gray-500 mt-1">
                  사용 가능한 변수: {"#{이름}, #{투어명}, #{출발일}, #{결제금액}"}
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={templateForm.is_active}
                    onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">활성화</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  resetTemplateForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTemplate ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 미리보기 모달 */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">메시지 미리보기</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 폰 모양 프레임 */}
            <div className="border-4 border-gray-800 rounded-[2rem] p-4 bg-gray-100">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">발신번호</span>
                  <span className="text-xs text-gray-700">{process.env.NEXT_PUBLIC_SOLAPI_SENDER || "031-215-3990"}</span>
                </div>
                
                {previewTitle && (
                  <h4 className="font-medium text-sm mb-2">{previewTitle}</h4>
                )}
                
                {previewImage && messageType === "mms" && (
                  <div className="mb-3">
                    <img 
                      src={previewImage} 
                      alt="MMS 첨부 이미지" 
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {previewContent}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {getByteLength(previewContent)}바이트
                  </span>
                  <span className="text-xs text-gray-500">
                    {getMessageTypeLabel(messageType)}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              실제 표시는 수신자 기기에 따라 다를 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* 공지사항 템플릿 선택기 */}
      {showNoticePicker && (
        <TemplatePicker
          onSelect={(content, shortContent) => {
            // 메시지용 짧은 버전이 있으면 사용, 없으면 전체 내용 사용
            if (shortContent && messageType === "sms") {
              // SMS일 때는 짧은 버전 우선
              setMessageContent(shortContent);
            } else {
              // LMS/MMS일 때는 전체 내용
              setMessageContent(shortContent || content);
            }
            setShowNoticePicker(false);
          }}
          onClose={() => setShowNoticePicker(false)}
          mode={messageType === "sms" ? "message" : "full"}
        />
      )}
    </div>
  );
}
