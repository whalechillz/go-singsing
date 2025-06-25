"use client";
import { useState, useEffect } from "react";
import { X, Send, CheckCircle, MessageSquare, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface TourConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
}

export default function TourConfirmationModal({ 
  isOpen, 
  onClose, 
  tourId
}: TourConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [messagePreview, setMessagePreview] = useState("");
  const [sendMethod, setSendMethod] = useState<"sms" | "kakao">("kakao");
  
  useEffect(() => {
    if (isOpen && tourId) {
      fetchData();
    }
  }, [isOpen, tourId]);
  
  const fetchData = async () => {
    setLoading(true);
    
    // 투어 정보 가져오기
    const { data: tourData } = await supabase
      .from("singsing_tours")
      .select("*")
      .eq("id", tourId)
      .single();
    
    setTour(tourData);
    
    // 확정된 참가자만 가져오기
    const { data: participantsData } = await supabase
      .from("singsing_participants")
      .select("*")
      .eq("tour_id", tourId)
      .eq("status", "확정");
    
    setParticipants(participantsData || []);
    
    // 투어 확정 템플릿 가져오기
    const { data: templateData } = await supabase
      .from("message_templates")
      .select("*")
      .eq("name", "투어 확정")
      .eq("is_active", true)
      .single();
    
    setTemplate(templateData);
    
    if (templateData && tourData) {
      generateMessagePreview(templateData, tourData);
    }
    
    setLoading(false);
  };
  
  const generateMessagePreview = (templateData: any, tourData: any) => {
    if (!templateData || !tourData) return;
    
    let message = templateData.content;
    
    // 변수 치환
    message = message.replace(/#{투어명}/g, tourData.title);
    message = message.replace(/#{출발일}/g, new Date(tourData.start_date).toLocaleDateString());
    
    // 포털 URL 생성 (실제로는 public_document_links에서 가져와야 함)
    const portalUrl = 'portal-url'; // 실제 URL로 대체 필요
    message = message.replace(/#{url}/g, portalUrl);
    
    setMessagePreview(message);
  };
  
  const handleSend = async () => {
    if (participants.length === 0) {
      alert("확정된 참가자가 없습니다.");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/messages/send-tour-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId,
          participantIds: participants.map(p => p.id),
          templateId: template.id,
          templateData: template,
          sendMethod
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`${participants.length}명에게 투어 확정 메시지가 발송되었습니다.`);
        onClose();
      } else {
        alert(result.error || '발송 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      console.error('발송 오류:', error);
      alert(`발송 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            투어 확정 안내 발송
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="text-center py-8 text-gray-500">불러오는 중...</div>
          ) : (
            <div className="space-y-6">
              {/* 투어 정보 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">{tour?.title}</h3>
                <p className="text-sm text-green-700 mt-1">
                  {tour && `${new Date(tour.start_date).toLocaleDateString()} ~ ${new Date(tour.end_date).toLocaleDateString()}`}
                </p>
                <p className="text-sm text-green-700">
                  상품가: {tour && Number(tour.price).toLocaleString()}원
                </p>
              </div>
              
              {/* 발송 대상 */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  발송 대상 (확정 참가자)
                </h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>확정된 참가자 {participants.length}명</p>
                  {participants.length === 0 && (
                    <p className="text-red-500 mt-1">확정된 참가자가 없습니다.</p>
                  )}
                </div>
              </div>
              
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
                    {messagePreview || '메시지를 불러오는 중...'}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * #{'{이름}'} 부분은 각 참가자의 이름으로 자동 치환됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSend}
            disabled={loading || participants.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "발송 중..." : `${participants.length}명에게 발송`}
          </button>
        </div>
      </div>
    </div>
  );
}
