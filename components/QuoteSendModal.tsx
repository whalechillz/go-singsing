"use client";
import { useState, useEffect } from "react";
import { X, Send, CheckCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface QuoteSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  quoteName: string;
  customerName?: string;
  customerPhone?: string;
  expiresAt?: string;
  publicUrl?: string;
}

export default function QuoteSendModal({ 
  isOpen, 
  onClose, 
  quoteId,
  quoteName,
  customerName,
  customerPhone,
  expiresAt,
  publicUrl
}: QuoteSendModalProps) {
  const [loading, setLoading] = useState(false);
  const [sendMethod, setSendMethod] = useState<"sms" | "kakao">("kakao");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [messagePreview, setMessagePreview] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(customerPhone || "");
  const [recipientName, setRecipientName] = useState(customerName || "");
  
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (selectedTemplate) {
      generateMessagePreview();
    }
  }, [selectedTemplate, recipientName, quoteName, publicUrl, expiresAt]);
  
  const fetchTemplates = async () => {
    setLoading(true);
    
    try {
      // 견적서용 템플릿 가져오기
      const { data: templatesData, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("use_case", "quote")
        .eq("is_active", true)
        .order("name");
      
      if (error) {
        console.error('템플릿 가져오기 에러:', error);
      } else {
        setTemplates(templatesData || []);
        
        // 기본 템플릿 선택
        if (templatesData && templatesData.length > 0) {
          // SMS 템플릿을 기본으로 선택 (카카오 템플릿은 승인 필요)
          const smsTemplate = templatesData.find(t => t.type === 'sms');
          if (smsTemplate) {
            setSelectedTemplate(smsTemplate);
            setSendMethod('sms');
          } else {
            setSelectedTemplate(templatesData[0]);
          }
        }
      }
    } catch (error) {
      console.error('템플릿 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateMessagePreview = () => {
    if (!selectedTemplate) return;
    
    // 견적서 URL 생성
    const quoteUrl = publicUrl 
      ? `https://go.singsinggolf.kr/q/${publicUrl}`
      : `https://go.singsinggolf.kr/quote/${quoteId}`;
    
    // 만료일 포맷팅
    const expiryDate = expiresAt ? new Date(expiresAt).toLocaleDateString('ko-KR') : '미정';
    
    // 템플릿 변수 치환
    let message = selectedTemplate.content || '';
    message = message.replace(/#{이름}/g, recipientName || '고객님');
    message = message.replace(/#{견적서명}/g, quoteName);
    message = message.replace(/#{url}/g, quoteUrl);
    message = message.replace(/#{만료일}/g, expiryDate);
    
    setMessagePreview(message);
  };
  
  const handleSend = async () => {
    if (!phoneNumber || !selectedTemplate) {
      alert("수신자 정보와 템플릿을 확인해주세요.");
      return;
    }
    
    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(phoneNumber.replace(/-/g, ''))) {
      alert("올바른 전화번호 형식이 아닙니다.");
      return;
    }
    
    setLoading(true);
    
    try {
      // 견적서 URL 생성
      const quoteUrl = publicUrl 
        ? `https://go.singsinggolf.kr/q/${publicUrl}`
        : `https://go.singsinggolf.kr/quote/${quoteId}`;
      
      console.log('발송 준비:', {
        quoteId,
        customerPhone: phoneNumber,
        customerName: recipientName,
        quoteUrl,
        sendMethod,
        templateId: selectedTemplate.id
      });
      
      // 만료일 포맷팅
      const expiryDate = expiresAt ? new Date(expiresAt).toLocaleDateString('ko-KR') : '미정';
      
      // API 호출
      // 발송 데이터 준비
      const sendData = {
        quoteId: quoteId,
        customerPhone: phoneNumber,
        customerName: recipientName || '고객님',
        templateId: selectedTemplate.id,
        templateData: selectedTemplate, // 템플릿 전체 데이터
        sendMethod: sendMethod
      };
      
      console.log('API 호출 데이터:', sendData);
      
      const response = await fetch('/api/messages/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendData)
      });
      
      // 응답 상태 확인
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      // 응답 텍스트 먼저 확인
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // JSON 파싱 시도
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // 응답이 JSON이 아닌 경우 처리
        if (response.ok) {
          // 성공 응답이지만 JSON이 아닌 경우
          alert('견적서가 발송되었습니다.');
          onClose();
          return;
        } else {
          throw new Error(`서버 오류: ${response.status} - ${responseText}`);
        }
      }
      
      if (result.success) {
        alert('견적서가 성공적으로 발송되었습니다.');
        onClose();
      } else {
        throw new Error(result.error || '발송 실패');
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
        {/* 헤더 */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5" />
            견적서 발송
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 본문 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* 견적서 정보 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">{quoteName}</h3>
              {expiresAt && (
                <p className="text-sm text-blue-700 mt-1">
                  유효기간: {new Date(expiresAt).toLocaleDateString('ko-KR')}까지
                </p>
              )}
            </div>
            
            {/* 수신자 정보 */}
            <div>
              <h3 className="font-medium mb-3">수신자 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* 발송 방법 */}
            <div>
              <h3 className="font-medium mb-3">발송 방법</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="kakao"
                    checked={sendMethod === "kakao"}
                    onChange={(e) => {
                      setSendMethod(e.target.value as "kakao");
                      const kakaoTemplate = templates.find(t => t.type === 'alimtalk');
                      if (kakaoTemplate) setSelectedTemplate(kakaoTemplate);
                    }}
                  />
                  <span>카카오 알림톡 (권장)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="sms"
                    checked={sendMethod === "sms"}
                    onChange={(e) => {
                      setSendMethod(e.target.value as "sms");
                      const smsTemplate = templates.find(t => t.type === 'sms');
                      if (smsTemplate) setSelectedTemplate(smsTemplate);
                    }}
                  />
                  <span>SMS</span>
                </label>
              </div>
            </div>
            
            {/* 템플릿 선택 */}
            {templates.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  메시지 템플릿
                </h3>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    setSelectedTemplate(template);
                  }}
                >
                  {templates
                    .filter(t => t.type === (sendMethod === 'kakao' ? 'alimtalk' : 'sms'))
                    .map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            
            {/* 메시지 미리보기 */}
            <div>
              <h3 className="font-medium mb-3">메시지 미리보기</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {messagePreview || '수신자 정보를 입력하면 미리보기가 표시됩니다.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        {/* 푸터 */}
        <div className="p-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {phoneNumber && selectedTemplate && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                발송 준비 완료
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
              disabled={loading || !phoneNumber || !selectedTemplate}
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
