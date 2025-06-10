"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  FileText
} from 'lucide-react';

export default function PublicQuotePage() {
  const params = useParams();
  const quoteId = params.id as string;
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);

  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      // 견적 정보 가져오기 (status가 quote인 것만)
      const { data: quoteData, error: quoteError } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", quoteId)
        .eq("status", "quote")
        .single();
      
      if (quoteError) throw new Error("견적을 찾을 수 없습니다.");
      
      // 투어 상품 정보 가져오기
      if (quoteData.tour_product_id) {
        const { data: productData } = await supabase
          .from("tour_products")
          .select("*")
          .eq("id", quoteData.tour_product_id)
          .single();
        
        quoteData.product = productData;
      }
      
      // quote_data 파싱
      if (quoteData.quote_data) {
        const parsed = typeof quoteData.quote_data === 'string' 
          ? JSON.parse(quoteData.quote_data) 
          : quoteData.quote_data;
        setQuoteData(parsed);
      }
      
      setQuote(quoteData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDays = () => {
    const start = new Date(quote.start_date);
    const end = new Date(quote.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days - 1}박 ${days}일`;
  };

  const getQuoteStatus = () => {
    if (!quote.quote_expires_at) return 'active';
    
    const today = new Date();
    const expiryDate = new Date(quote.quote_expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    return 'active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">견적서를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            유효하지 않은 견적서이거나 만료된 견적서입니다.
          </p>
        </div>
      </div>
    );
  }

  const status = getQuoteStatus();
  
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">견적서가 만료되었습니다</h1>
          <p className="text-gray-600">
            이 견적서의 유효기간이 지났습니다.<br />
            새로운 견적을 요청해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">싱싱골프투어 견적서</h1>
            <p className="text-blue-100">여행의 시작, 싱싱골프투어와 함께하세요</p>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 견적 정보 카드 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{quote.title}</h2>
              <p className="text-gray-600">
                견적일: {formatDate(quote.quoted_at || quote.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">유효기간</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatDate(quote.quote_expires_at)}까지
              </p>
            </div>
          </div>

          {/* 고객 정보 */}
          {quote.customer_name && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">고객 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">성함:</span>
                  <span className="ml-2 font-medium">{quote.customer_name}님</span>
                </div>
                {quote.customer_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{quote.customer_phone}</span>
                  </div>
                )}
                {quote.customer_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{quote.customer_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 투어 상세 정보 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">투어 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">투어 상품</p>
                    <p className="font-medium">{quote.product?.name || '미정'}</p>
                    {quote.product?.golf_course && (
                      <p className="text-sm text-gray-600 mt-1">
                        골프장: {quote.product.golf_course}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">여행 일정</p>
                    <p className="font-medium">
                      {formatDate(quote.start_date)} ~ {formatDate(quote.end_date)}
                    </p>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      {calculateDays()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">인원</p>
                    <p className="font-medium">{quote.max_participants}명</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">1인 요금</p>
                    <p className="text-xl font-bold text-blue-600">
                      {quote.price.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 총액 표시 */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-2">총 예상 금액</p>
              <p className="text-3xl font-bold text-blue-800">
                {(quote.price * quote.max_participants).toLocaleString()}원
              </p>
              <p className="text-sm text-gray-600 mt-2">
                ({quote.max_participants}명 × {quote.price.toLocaleString()}원)
              </p>
            </div>
          </div>

          {/* 일정 정보 */}
          {quoteData?.schedules && quoteData.schedules.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">상세 일정</h3>
              <div className="space-y-3">
                {quoteData.schedules.map((schedule: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">D{schedule.day}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {new Date(schedule.date).toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                      {schedule.title && (
                        <div className="text-gray-700 mt-1">{schedule.title}</div>
                      )}
                      {schedule.description && (
                        <div className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                          {schedule.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 추가 정보 */}
          {quote.quote_notes && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">추가 안내사항</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{quote.quote_notes}</p>
            </div>
          )}
        </div>

        {/* 문의 안내 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-lg font-semibold mb-4">문의하기</h3>
          <p className="text-gray-700 mb-4">
            견적에 대해 궁금하신 점이 있으시거나 예약을 원하시면 아래 연락처로 문의해 주세요.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <span className="font-medium">02-1234-5678</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-medium">info@singsinggolf.kr</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>유의사항:</strong> 이 견적서는 {formatDate(quote.quote_expires_at)}까지 유효하며,
              해당 기간 이후에는 요금이 변경될 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="bg-gray-100 mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p className="mb-2">© 2025 싱싱골프투어. All rights reserved.</p>
          <p>본 견적서는 싱싱골프투어에서 발행한 공식 견적서입니다.</p>
        </div>
      </div>
    </div>
  );
}