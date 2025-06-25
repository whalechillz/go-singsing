"use client";
import { useState, useEffect } from "react";
import { X, Send, CheckCircle, AlertCircle, Users, FileText, Clock, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface DocumentSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
  selectedParticipants?: string[]; // 선택된 참가자 ID 배열
}

const getDocumentTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'portal': '종합 여정 안내',
    'customer_all': '고객용 통합',
    'staff_all': '스탭용 통합',
    'golf_timetable': '골프장 티타임표',
    'customer_schedule': '일정표 안내',
    'staff_schedule': '스탭용 일정표',
    'customer_boarding': '탑승 안내',
    'staff_boarding': '스탭용 탑승안내',
    'room_assignment': '객실 배정',
    'room_assignment_staff': '스탭용 객실배정',
    'customer_timetable': '티타임표 안내',
    'staff_timetable': '스탭용 티타임표',
    'simplified': '간편일정 안내',
  };
  return typeMap[type] || type;
};

// 문서 타입과 템플릿 매핑
const documentTypeToTemplate: Record<string, string> = {
  'portal': '종합 여정 안내',
  'customer_schedule': '일정표 안내',
  'staff_schedule': '스탭용 일정표',
  'customer_boarding': '탑승 안내',
  'staff_boarding': '스탭용 탑승안내',
  'room_assignment': '객실 배정',
  'room_assignment_staff': '스탭용 객실배정',
  'customer_timetable': '티타임표 안내',
  'staff_timetable': '스탭용 티타임표',
  'simplified': '간편일정 안내',
};

export default function DocumentSendModal({ 
  isOpen, 
  onClose, 
  tourId,
  selectedParticipants = []
}: DocumentSendModalProps) {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [tour, setTour] = useState<any>(null);
  const [sendMethod, setSendMethod] = useState<"sms" | "kakao">("kakao");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [sendHistory, setSendHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  useEffect(() => {
    if (isOpen && tourId) {
      fetchData();
    }
  }, [isOpen, tourId]);
  
  const fetchData = async () => {
    setLoading(true);
    console.log('DocumentSendModal fetchData 시작:', { tourId, selectedParticipants });
    
    // 투어 정보 가져오기
    const { data: tourData } = await supabase
      .from("singsing_tours")
      .select("*")
      .eq("id", tourId)
      .single();
    
    console.log('투어 데이터:', tourData);
    setTour(tourData);
    
    // 문서 링크 가져오기 (public_document_links 또는 document_links)
    let docsQuery = supabase
      .from("public_document_links")
      .select("*")
      .eq("tour_id", tourId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    
    let { data: docsData, error: docsError } = await docsQuery;
    
    // public_document_links가 없으면 document_links 시도
    if (docsError || !docsData || docsData.length === 0) {
      const { data: altDocsData } = await supabase
        .from("document_links")
        .select("*")
        .eq("tour_id", tourId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (altDocsData) {
        docsData = altDocsData;
      }
    }
    
    console.log('문서 데이터:', docsData);
    setDocuments(docsData || []);
    
    // 참가자 정보 가져오기
    if (selectedParticipants.length > 0) {
      const { data: participantsData } = await supabase
        .from("singsing_participants")
        .select("*")
        .in("id", selectedParticipants);
      
      console.log('참가자 데이터:', participantsData);
      setParticipants(participantsData || []);
    } else {
      // 전체 참가자 가져오기 (확정, 미확정 포함)
      const { data: participantsData } = await supabase
        .from("singsing_participants")
        .select("*")
        .eq("tour_id", tourId)
        .in("status", ["확정", "미확정"]); // 취소된 참가자만 제외
      
      console.log('전체 참가자 데이터:', participantsData);
      setParticipants(participantsData || []);
    }
    
    // 메시지 템플릿 가져오기
    const { data: templatesData, error: templatesError } = await supabase
      .from("message_templates")
      .select("*")
      .eq("use_case", "tour_document")
      .eq("is_active", true)
      .order("name");
    
    console.log('템플릿 데이터:', templatesData);
    console.log('템플릿 에러:', templatesError);
    setTemplates(templatesData || []);
    
    // 발송 이력 가져오기 (테이블이 없을 수 있으므로 에러 처리)
    try {
      const { data: historyData, error: historyError } = await supabase
        .from("document_send_history")
        .select("*")
        .eq("tour_id", tourId)
        .order("sent_at", { ascending: false })
        .limit(10);
      
      if (!historyError) {
        setSendHistory(historyData || []);
      }
    } catch (error) {
      console.log('발송 이력 테이블이 없거나 접근 불가:', error);
      setSendHistory([]);
    }
    
    setLoading(false);
  };
  
  const handleDocSelect = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
    
    // 문서 선택시 해당 템플릿 자동 선택
    const doc = documents.find(d => d.id === docId);
    if (doc && documentTypeToTemplate[doc.document_type]) {
      const templateName = documentTypeToTemplate[doc.document_type];
      const template = templates.find(t => t.name === templateName);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  };
  
  const generateMessage = () => {
    if (!tour || selectedDocs.length === 0 || !selectedTemplate) return "";
    
    const doc = documents.find(d => d.id === selectedDocs[0]); // 첫번째 문서 기준
    const url = doc?.public_url ? 
      doc.public_url :
      doc?.short_code;
    
    // 템플릿 변수 치환
    let message = selectedTemplate.content;
    message = message.replace(/#{투어명}/g, tour.title);
    message = message.replace(/#{url}/g, url);
    
    // 버튼의 URL도 치환
    if (selectedTemplate.buttons && selectedTemplate.buttons.length > 0) {
      const updatedButtons = selectedTemplate.buttons.map((btn: any) => ({
        ...btn,
        linkMo: btn.linkMo?.replace(/#{url}/g, url),
        linkPc: btn.linkPc?.replace(/#{url}/g, url)
      }));
      selectedTemplate.buttons = updatedButtons;
    }
    
    return message;
  };
  
  useEffect(() => {
    if (selectedTemplate) {
      setMessageTemplate(generateMessage());
    }
  }, [selectedDocs, selectedTemplate, tour, documents]);
  
  const handleSend = async () => {
    if (selectedDocs.length === 0 || participants.length === 0) {
      alert("문서와 참가자를 선택해주세요.");
      return;
    }
    
    if (!selectedTemplate) {
      alert("메시지 템플릿을 선택해주세요.");
      return;
    }
    
    setLoading(true);
    console.log('발송 시작:', {
      tourId,
      documentIds: selectedDocs,
      participantIds: participants.map(p => p.id),
      sendMethod,
      messageTemplate,
      templateId: selectedTemplate.id
    });
    
    try {
      // API 호출 with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃
      
      const response = await fetch('/api/messages/send-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId,
          documentIds: selectedDocs,
          participantIds: participants.map(p => p.id),
          sendMethod,
          messageTemplate,
          templateId: selectedTemplate.id,
          templateData: selectedTemplate
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('API 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API 응답 결과:', result);
      
      if (result.success) {
        alert(result.message || `${participants.length}명에게 문서가 발송되었습니다.`);
        onClose();
      } else {
        console.error('API 에러:', result);
        alert(result.error || '발송 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('발송 오류:', error);
      if (error.name === 'AbortError') {
        alert('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      } else {
        alert(`발송 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5" />
            투어 문서 발송
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 본문 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="text-center py-8 text-gray-500">불러오는 중...</div>
          ) : (
            <div className="space-y-6">
              {/* 투어 정보 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">{tour?.title}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {new Date(tour?.start_date).toLocaleDateString()} ~ {new Date(tour?.end_date).toLocaleDateString()}
                </p>
              </div>
              
              {/* 발송 대상 */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  발송 대상 ({participants.length}명)
                </h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {selectedParticipants.length > 0 ? (
                    <p>선택된 참가자 {participants.length}명</p>
                  ) : (
                    <p>전체 참가자 {participants.length}명 (확정, 미확정 포함)</p>
                  )}
                  {participants.length === 0 && (
                    <p className="text-red-500 mt-1">발송할 참가자가 없습니다.</p>
                  )}
                </div>
              </div>
              
              {/* 문서 선택 */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  발송할 문서 선택
                </h3>
                {documents.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                    <p>생성된 문서 링크가 없습니다.</p>
                    <p className="text-sm mt-1">문서 링크 관리에서 먼저 문서를 생성해주세요.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                    <label 
                      key={doc.id} 
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => handleDocSelect(doc.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                      <div className="font-medium">{doc.title || getDocumentTypeName(doc.document_type)}</div>
                      <div className="text-sm text-gray-500">
                        {doc.public_url ? 
                          `https://go.singsinggolf.kr/s/${doc.public_url}` :
                          `https://go.singsinggolf.kr/s/${doc.short_code}`
                        }
                      </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        생성: {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </label>
                  ))}
                </div>
                )}
              </div>
              
              {/* 템플릿 선택 */}
              {selectedDocs.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    메시지 템플릿 선택
                  </h3>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      setSelectedTemplate(template);
                    }}
                  >
                    <option value="">템플릿 선택</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* 발송 방법 */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  발송 방법
                </h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="kakao"
                      checked={sendMethod === "kakao"}
                      onChange={(e) => setSendMethod(e.target.value as "kakao")}
                    />
                    <span>카카오 알림톡 (권장)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="sms"
                      checked={sendMethod === "sms"}
                      onChange={(e) => setSendMethod(e.target.value as "sms")}
                    />
                    <span>SMS</span>
                  </label>
                </div>
              </div>
              
              {/* 메시지 미리보기 */}
              <div>
                <h3 className="font-medium mb-3">메시지 미리보기</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {messageTemplate || '템플릿을 선택하면 미리보기가 표시됩니다.'}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * #{'{이름}'} 부분은 각 참가자의 이름으로 자동 치환됩니다.
                </p>
              </div>
              
              {/* 발송 이력 */}
              <div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  최근 발송 이력 보기
                </button>
                
                {showHistory && sendHistory.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {sendHistory.map((history) => (
                      <div key={history.id} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span>{new Date(history.sent_at).toLocaleString()}</span>
                          <span className="text-gray-500">
                            {history.participant_count}명 / {history.send_method}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 푸터 */}
        <div className="p-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedDocs.length > 0 && participants.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {selectedDocs.length}개 문서를 {participants.length}명에게 발송
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSend}
              disabled={loading || selectedDocs.length === 0 || participants.length === 0 || !selectedTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? "발송 중..." : "발송하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
