"use client";
import { useState, useEffect } from "react";
import { X, Send, FileText, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface QuoteMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
}

export default function QuoteMessageModal({ 
  isOpen, 
  onClose, 
  quote
}: QuoteMessageModalProps) {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [messagePreview, setMessagePreview] = useState("");
  const [sendMethod, setSendMethod] = useState<"sms" | "kakao">("kakao");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  
  useEffect(() => {
    if (isOpen && quote) {
      fetchTemplate();
      setCustomerPhone(quote.customer_phone || "");
      setCustomerName(quote.customer_name || "");
    }
  }, [isOpen, quote]);
  
  const fetchTemplate = async () => {
    setLoading(true);
    
    // 견적서 안내 템플릿 가져오기
    const { data: templateData } = await supabase
      .from("message_templates")
      .select("*")
      .eq("name", "견적서 안내")
      .eq("is_active", true)
      .single();
    
    setTemplate(templateData);
    
    if (templateData && quote) {
      generateMessagePreview(templateData);
    }
    
    setLoading(false);
  };
  
  const generateMessagePreview = (templateData: any) => {
    if (!templateData || !quote) return;
    
    let message = templateData.content;
    const tourPrice = Number(quote.price);
    const totalAmount = tourPrice * (quote.max_participants || 1);
    
    // 변수 치환
    message = message.replace(/#{이름}/g, customerName || '고객');
    message = message.replace(/#{투어명}/g, quote.title);
    message = message.replace(/#{총금액}/g, totalAmount.toLocaleString());
    message = message.replace(/#{출발일}/g, new Date(quote.start_date).toLocaleDateString());
    message = message.replace(/#{인원}/g, quote.max_participants || '1');
    message = message.replace(/#{quote_id}/g, quote.id);
    
    setMessagePreview(message);
  };
  
  useEffect(() => {
    if (template && quote) {
      generateMessagePreview(template);
    }
  }, [customerName, template, quote]);
  
  const handleSend = async () => {
    if (!customerPhone) {
      alert("전화번호를 입력해주세요.");
      return;
    }
    
    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]{8,9}$/;
    const cleanPhone = customerPhone.replace(/-/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      alert("올바른 전화번호 형식이 아닙니다. (예: 01012345678)");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/messages/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quote.id,
          customerPhone: cleanPhone,
          customerName: customerName || '고객',
          templateId: template.id,
          templateData: template,
          sendMethod
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 견적서에 고객 정보 업데이트
        await supabase
          .from("quotes")
          .update({
            customer_phone: cleanPhone,
            customer_name: customerName || null
          })
          .eq("id", quote.id);
          
        alert("견적서가 발송되었습니다.");
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
            <FileText className="w-5 h-5" />
            견적서 발송
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
              {/* 견적 정보 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">{quote?.title}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {quote && `${new Date(quote.start_date).toLocaleDateString()} ~ ${new Date(quote.end_date).toLocaleDateString()}`}
                </p>
                <p className="text-sm text-blue-700">
                  {quote?.max_participants}명 / {quote && Number(quote.price).toLocaleString()}원
                </p>
              </div>
              
              {/* 고객 정보 입력 */}
              <div>
                <h3 className="font-medium mb-3">고객 정보</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      고객명
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="고객명을 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호 *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      하이픈(-) 없이 숫자만 입력하세요
                    </p>
                  </div>
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
                <div className="mt-2 text-sm text-gray-600">
                  <p>견적서 링크: https://go.singsinggolf.kr/quote/{quote?.id}</p>
                </div>
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
            disabled={loading || !customerPhone}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "발송 중..." : "발송하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
