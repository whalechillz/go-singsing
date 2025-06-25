"use client";
import { useState, useEffect } from "react";
import { X, Send, CreditCard, MessageSquare, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface PaymentMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
  payment?: any; // 특정 결제 정보 (선택적)
  participants?: any[]; // 선택된 참가자들 (선택적)
  messageType: 'deposit_request' | 'balance_request' | 'deposit_confirmation' | 'payment_complete';
}

export default function PaymentMessageModal({ 
  isOpen, 
  onClose, 
  tourId,
  payment,
  participants: selectedParticipants,
  messageType
}: PaymentMessageModalProps) {
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
  }, [isOpen, tourId, messageType]);
  
  const fetchData = async () => {
    setLoading(true);
    
    // 투어 정보 가져오기
    const { data: tourData } = await supabase
      .from("singsing_tours")
      .select("*")
      .eq("id", tourId)
      .single();
    
    setTour(tourData);
    
    // 참가자 정보 가져오기
    if (selectedParticipants) {
      setParticipants(selectedParticipants);
    } else {
      // 전체 참가자 가져오기
      let query = supabase
        .from("singsing_participants")
        .select("*")
        .eq("tour_id", tourId)
        .in("status", ["확정", "미확정"]);
      
      // 결제 유형에 따라 필터링
      if (messageType === 'deposit_confirmation' || messageType === 'payment_complete') {
        // 결제 확인 메시지는 결제한 사람에게만
        const { data: payments } = await supabase
          .from("singsing_payments")
          .select("participant_id")
          .eq("tour_id", tourId)
          .eq("payment_status", "completed");
        
        const paidParticipantIds = [...new Set(payments?.map(p => p.participant_id) || [])];
        query = query.in("id", paidParticipantIds);
      }
      
      const { data: participantsData } = await query;
      setParticipants(participantsData || []);
    }
    
    // 템플릿 가져오기
    const templateMap = {
      'deposit_request': '계약금 요청',
      'balance_request': '잔금 요청',
      'deposit_confirmation': '계약금 확인',
      'payment_complete': '결제 완료'
    };
    
    const { data: templateData } = await supabase
      .from("message_templates")
      .select("*")
      .eq("name", templateMap[messageType])
      .eq("is_active", true)
      .single();
    
    setTemplate(templateData);
    
    setLoading(false);
  };
  
  useEffect(() => {
    if (template && tour) {
      generateMessagePreview();
    }
  }, [template, tour, participants]);
  
  const generateMessagePreview = () => {
    if (!template || !tour) return;
    
    let message = template.content;
    const tourPrice = Number(tour.price);
    
    // 공통 변수 치환
    message = message.replace(/#{투어명}/g, tour.title);
    message = message.replace(/#{출발일}/g, new Date(tour.start_date).toLocaleDateString());
    message = message.replace(/#{은행명}/g, '국민은행');
    message = message.replace(/#{계좌번호}/g, '294537-04-018035');
    
    // 메시지 타입별 변수 치환
    switch (messageType) {
      case 'deposit_request':
        const depositAmount = 100000; // 계약금 100,000원 고정
        message = message.replace(/#{계약금}/g, depositAmount.toLocaleString());
        break;
        
      case 'balance_request':
        // 잔금 = 투어 가격 - 계약금(100,000원)
        const balanceAmount = tourPrice - 100000;
        const deadline = new Date();
        deadline.setDate(new Date(tour.start_date).getDate() - 7); // 출발 7일 전
        
        message = message.replace(/#{잔금}/g, balanceAmount.toLocaleString());
        message = message.replace(/#{납부기한}/g, deadline.toLocaleDateString());
        message = message.replace(/#{추가안내}/g, '');
        break;
        
      case 'deposit_confirmation':
        const paidDeposit = 100000; // 계약금 100,000원 고정
        message = message.replace(/#{계약금}/g, paidDeposit.toLocaleString());
        break;
        
      case 'payment_complete':
        message = message.replace(/#{총금액}/g, tourPrice.toLocaleString());
        message = message.replace(/#{url}/g, 'portal-url'); // 실제 포털 URL로 대체 필요
        break;
    }
    
    setMessagePreview(message);
  };
  
  const handleSend = async () => {
    if (participants.length === 0) {
      alert("발송할 참가자가 없습니다.");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/messages/send-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId,
          participantIds: participants.map(p => p.id),
          templateId: template.id,
          templateData: template,
          messageType,
          sendMethod
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`${participants.length}명에게 메시지가 발송되었습니다.`);
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
  
  const getModalTitle = () => {
    const titles = {
      'deposit_request': '계약금 요청 메시지 발송',
      'balance_request': '잔금 요청 메시지 발송',
      'deposit_confirmation': '계약금 입금 확인 메시지 발송',
      'payment_complete': '결제 완료 메시지 발송'
    };
    return titles[messageType];
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {getModalTitle()}
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">{tour?.title}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {tour && `${new Date(tour.start_date).toLocaleDateString()} ~ ${new Date(tour.end_date).toLocaleDateString()}`}
                </p>
                <p className="text-sm text-blue-700">
                  상품가: {tour && Number(tour.price).toLocaleString()}원
                </p>
              </div>
              
              {/* 발송 대상 */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  발송 대상 ({participants.length}명)
                </h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {messageType === 'deposit_confirmation' || messageType === 'payment_complete' ? (
                    <p>결제 완료한 참가자 {participants.length}명</p>
                  ) : (
                    <p>전체 참가자 {participants.length}명</p>
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "발송 중..." : `${participants.length}명에게 발송`}
          </button>
        </div>
      </div>
    </div>
  );
}
