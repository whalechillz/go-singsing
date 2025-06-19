"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Info,
  X,
  Printer,
  FileText
} from 'lucide-react';

interface QuoteViewSimpleProps {
  quoteId: string;
}

export default function QuoteViewSimple({ quoteId }: QuoteViewSimpleProps) {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [journeyItems, setJourneyItems] = useState<any[]>([]);

  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      // 견적 정보 가져오기
      const { data: quoteData, error: quoteError } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", quoteId)
        .not('quote_data', 'is', null)
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
      
      // tour_journey_items 가져오기
      const { data: journeyData } = await supabase
        .from("tour_journey_items")
        .select(`
          *,
          spot:tourist_attractions!spot_id(*)
        `)
        .eq("tour_id", quoteId)
        .gt("order_index", 0)
        .order("day_number")
        .order("order_index");
      
      if (journeyData) {
        setJourneyItems(journeyData);
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

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`;
  };

  const calculateDays = () => {
    const start = new Date(quote.start_date);
    const end = new Date(quote.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { nights: days - 1, days };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDetailVersion = () => {
    // 상세 버전으로 이동
    window.location.href = `/quote/${quoteId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">견적서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">견적서를 찾을 수 없습니다</h1>
          <p className="text-gray-600">유효하지 않은 견적서입니다.</p>
        </div>
      </div>
    );
  }

  const duration = calculateDays();

  return (
    <div className="simple-quote-view">
      {/* 프린트 버튼 - 프린트 시 숨김 */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handleDetailVersion}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-700 flex items-center gap-2 text-lg font-medium"
        >
          <FileText className="w-6 h-6" />
          상세 버전
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2 text-lg font-medium"
        >
          <Printer className="w-6 h-6" />
          프린트/PDF 저장
        </button>
      </div>

      {/* A4 단일 페이지 레이아웃 - flex로 중앙정렬 */}
      <div className="max-w-[210mm] mx-auto p-8 bg-white min-h-[297mm] flex flex-col">
        {/* 헤더 */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold tracking-wider">SINGSING</h1>
          <p className="text-xs text-gray-600">🚌 2박3일 골프패키지 · 리무진버스 단체투어 · 전문 기사가이드 동행</p>
        </div>

        {/* 메인 컨텐츠 - flex-grow로 공간 채우기 */}
        <div className="flex-grow">
          {/* 투어 제목 및 날짜 통합 */}
          <div className="mb-5 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-300">
            <p className="text-center text-sm text-gray-600 mb-2">견적서</p>
            <h2 className="text-xl font-bold text-center text-blue-900 mb-2">
              {quote.title}
            </h2>
            <div className="text-center">
              <p className="text-sm font-medium">
                <Calendar className="inline w-4 h-4 mr-1" />
                {formatDate(quote.start_date)} ~ {formatDate(quote.end_date)}
              </p>
              <p className="text-blue-600 font-bold text-sm">{duration.nights}박 {duration.days}일 일정</p>
            </div>
          </div>

          {/* 가격 정보와 일정 통합 */}
          <div className="mb-5">
            {/* 가격 정보 */}
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <h3 className="text-xl font-bold mb-3 text-center">견적 금액</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-base mb-1">1인 요금</p>
                  <p className="text-2xl font-bold">{quote.price.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-base mb-1">예상 인원</p>
                  <p className="text-2xl font-bold">{quoteData?.participants?.estimated_count || quote.max_participants}명</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-base mb-1">총 예상 금액</p>
                  <p className="text-2xl font-bold">
                    {((quoteData?.participants?.estimated_count || quote.max_participants) * quote.price).toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
            
            {/* 여행 일정 - 가격 박스 바로 아래 연결 */}
            <div className="p-4 bg-gray-50 rounded-b-xl border border-t-0 border-gray-200">
              <h3 className="text-base font-bold mb-2 text-center">여행 일정</h3>
              <div className="grid grid-cols-1 gap-2">
                {Array.from(new Set(journeyItems.map(item => item.day_number))).slice(0, 3).map(dayNum => {
                  const dayItems = journeyItems.filter(item => item.day_number === dayNum);
                  const scheduleDate = new Date(quote.start_date);
                  scheduleDate.setDate(scheduleDate.getDate() + dayNum - 1);
                  
                  return (
                    <div key={dayNum} className="flex items-center gap-3 p-2">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        D{dayNum}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{formatDateShort(scheduleDate.toISOString())}</p>
                        <p className="text-gray-700 text-sm">
                          {dayItems.slice(0, 4).map(item => item.spot?.name).filter(Boolean).join(' → ')}
                          {dayItems.length > 4 && ` 외 ${dayItems.length - 4}곳`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 포함/불포함 사항 - 더 깔끔하게 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-4 bg-green-50 rounded-lg border border-green-300">
              <h3 className="text-lg font-bold text-green-800 mb-2 flex items-center gap-1">
                <CheckCircle className="w-5 h-5" />
                포함 사항
              </h3>
              <ul className="space-y-1.5 text-sm">
                {(quoteData?.includeExclude?.includes || [
                  '왕복 전용버스',
                  '그린피 및 카트비',
                  `숙박 (${duration.nights}박)`,
                  '조식 제공'
                ]).map((item: string, index: number) => (
                  item && (
                    <li key={index} className="flex items-start gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-300">
              <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-1">
                <X className="w-5 h-5" />
                불포함 사항
              </h3>
              <ul className="space-y-1.5 text-sm">
                {(quoteData?.includeExclude?.excludes || [
                  '개인 경비',
                  '캐디피',
                  '중식 및 석식',
                  '여행자 보험'
                ]).map((item: string, index: number) => (
                  item && (
                    <li key={index} className="flex items-start gap-1.5">
                      <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          </div>

          {/* 추가 안내사항 */}
          {quote.quote_notes && (
            <div className="mb-5 p-4 bg-yellow-50 rounded-lg border border-yellow-400">
              <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-1">
                <Info className="w-5 h-5" />
                추가 안내사항
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.quote_notes}</p>
            </div>
          )}

        </div>

        {/* 하단 예약 문의 - 페이지 하단에 고정 */}
        <div className="border-t border-gray-300 pt-5">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-3">예약 문의</h3>
            <div className="flex justify-center items-center gap-6">
              <a href="tel:031-215-3990" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-base">031-215-3990</span>
              </a>
              <a href="mailto:singsinggolf@naver.com" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-base">singsinggolf@naver.com</span>
              </a>
            </div>
            <p className="mt-3 text-gray-600 text-sm">
              견적 유효기간: {formatDate(quote.quote_expires_at)}까지
            </p>
          </div>
        </div>
      </div>

      {/* 프린트 전용 스타일 */}
      <style jsx>{`
        @media print {
          .simple-quote-view {
            font-size: 13pt !important;
          }
          
          .simple-quote-view h1 {
            font-size: 20pt !important;
            font-weight: 900 !important;
          }
          
          .simple-quote-view h2 {
            font-size: 18pt !important;
            font-weight: 800 !important;
          }
          
          .simple-quote-view h3 {
            font-size: 16pt !important;
            font-weight: 700 !important;
          }
          
          .simple-quote-view p,
          .simple-quote-view li {
            font-size: 13pt !important;
            line-height: 1.6 !important;
            font-weight: 500 !important;
          }
          
          .simple-quote-view .text-xs {
            font-size: 11pt !important;
          }
          
          .simple-quote-view .text-sm {
            font-size: 12pt !important;
          }
          
          .simple-quote-view .text-base {
            font-size: 13pt !important;
          }
          
          .simple-quote-view .text-lg {
            font-size: 15pt !important;
          }
          
          .simple-quote-view .text-xl {
            font-size: 17pt !important;
            font-weight: 700 !important;
          }
          
          .simple-quote-view .text-2xl {
            font-size: 19pt !important;
            font-weight: 700 !important;
          }
          
          .simple-quote-view .text-3xl {
            font-size: 22pt !important;
            font-weight: 800 !important;
          }
          
          .simple-quote-view .text-4xl {
            font-size: 26pt !important;
            font-weight: 900 !important;
          }
          
          /* 가격 정보 강조 */
          .simple-quote-view .bg-gradient-to-r {
            border: 2px solid #1e40af !important;
            background: #eff6ff !important;
            color: #1e40af !important;
          }
          
          /* 가격과 일정 연결 박스 */
          .simple-quote-view .bg-gray-50 {
            border: 1px solid #6b7280 !important;
          }
          
          /* 포함/불포함 사항 강조 */
          .simple-quote-view .bg-green-50 {
            border: 1.5px solid #16a34a !important;
          }
          
          .simple-quote-view .bg-red-50 {
            border: 1.5px solid #dc2626 !important;
          }
          
          /* 추가 안내사항 */
          .simple-quote-view .bg-yellow-50 {
            border: 1.5px solid #ca8a04 !important;
          }
          
          @page {
            margin: 10mm;
            size: A4;
          }
          
          /* A4 용지에 맞춤 */
          .simple-quote-view .max-w-\[210mm\] {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
