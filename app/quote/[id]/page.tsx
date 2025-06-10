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
  Phone,
  Mail,
  FileText,
  Utensils,
  Home,
  Bus,
  Flag,
  Camera,
  ChevronRight,
  Download,
  Share2,
  CheckCircle,
  Info,
  X
} from 'lucide-react';

export default function PublicQuotePage() {
  const params = useParams();
  const quoteId = params.id as string;
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [journeyItems, setJourneyItems] = useState<any[]>([]);

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
      
      // tour_journey_items 가져오기
      const { data: journeyData } = await supabase
        .from("tour_journey_items")
        .select(`
          *,
          spot:tourist_attractions!spot_id(*)
        `)
        .eq("tour_id", quoteId)
        .gt("order_index", 0) // DAY_INFO 제외
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

  const getQuoteStatus = () => {
    if (!quote.quote_expires_at) return 'active';
    
    const today = new Date();
    const expiryDate = new Date(quote.quote_expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    return 'active';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `싱싱골프투어 견적서 - ${quote.title}`,
        text: `${quote.title} 견적서를 확인해보세요.`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    }
  };

  const handleDownloadPDF = () => {
    // PDF 다운로드 기능 구현
    alert('PDF 다운로드 기능은 준비 중입니다.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">견적서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-red-500" />
          </div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">견적서가 만료되었습니다</h1>
          <p className="text-gray-600">
            이 견적서의 유효기간이 지났습니다.<br />
            새로운 견적을 요청해 주세요.
          </p>
        </div>
      </div>
    );
  }

  const duration = calculateDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">싱싱골프투어</h1>
                <p className="text-xs text-gray-500">Premium Golf Tour</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="공유하기"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="PDF 다운로드"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90"></div>
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
              <Calendar className="w-4 h-4" />
              {formatDate(quote.start_date)} ~ {formatDate(quote.end_date)}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {quote.title}
            </h1>
            
            <p className="text-xl mb-8 text-blue-100">
              {duration.nights}박 {duration.days}일의 특별한 여행
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <MapPin className="w-4 h-4" />
                {quote.product?.golf_course || '골프장 미정'}
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Users className="w-4 h-4" />
                {quoteData?.participants?.estimated_count || quote.max_participants}명
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Home className="w-4 h-4" />
                {quote.product?.hotel || '숙소 미정'}
              </div>
            </div>
          </div>
        </div>

        {/* 웨이브 효과 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 일정 타임라인 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                여행 일정
              </h2>
              
              {journeyItems.length > 0 ? (
                <div className="space-y-6">
                  {/* 일자별로 그룹핑 */}
                  {Array.from(new Set(journeyItems.map(item => item.day_number))).map(dayNum => {
                    const dayItems = journeyItems.filter(item => item.day_number === dayNum);
                    const scheduleDate = new Date(quote.start_date);
                    scheduleDate.setDate(scheduleDate.getDate() + dayNum - 1);
                    
                    return (
                      <div
                        key={dayNum}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                          selectedDay === dayNum
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            dayNum === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            dayNum === duration.days ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                            'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}>
                            D{dayNum}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {formatDateShort(scheduleDate.toISOString())}
                              </h3>
                              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                                selectedDay === dayNum ? 'rotate-90' : ''
                              }`} />
                            </div>
                            
                            {/* 주요 정류지 표시 */}
                            <div className="flex flex-wrap gap-2 mb-2">
                              {dayItems.slice(0, 3).map((item, idx) => (
                                <span key={idx} className="text-sm text-gray-700">
                                  {item.spot?.name}{idx < Math.min(2, dayItems.length - 1) && ' → '}
                                </span>
                              ))}
                              {dayItems.length > 3 && (
                                <span className="text-sm text-gray-500">... 외 {dayItems.length - 3}곳</span>
                              )}
                            </div>
                            
                            {/* 일정 하이라이트 아이콘 */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {dayNum === 1 && (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                                    <Bus className="w-3 h-3" /> 출발
                                  </span>
                                </>
                              )}
                              {dayItems.some(item => item.spot?.category === 'boarding') && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                                  <Bus className="w-3 h-3" /> 탑승
                                </span>
                              )}
                              {dayItems.some(item => item.spot?.category === 'golf_round') && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs">
                                  <Flag className="w-3 h-3" /> 골프
                                </span>
                              )}
                              {dayItems.some(item => item.spot?.category === 'tourist_spot') && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                                  <Camera className="w-3 h-3" /> 관광
                                </span>
                              )}
                              {dayItems.some(item => item.spot?.category === 'restaurant' || item.meal_type) && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
                                  <Utensils className="w-3 h-3" /> 식사
                                </span>
                              )}
                              {dayNum === duration.days && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                                  <Home className="w-3 h-3" /> 도착
                                </span>
                              )}
                            </div>
                            
                            {selectedDay === dayNum && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                {dayItems.map((item, index) => (
                                  <div key={item.id} className="flex gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-gray-900">{item.spot?.name || '알 수 없음'}</h4>
                                        {item.arrival_time && (
                                          <span className="text-xs text-gray-500">{item.arrival_time}</span>
                                        )}
                                      </div>
                                      {item.spot?.address && (
                                        <p className="text-sm text-gray-600">{item.spot.address}</p>
                                      )}
                                      {item.meal_type && item.meal_menu && (
                                        <p className="text-sm text-orange-600 mt-1">
                                          {item.meal_type}: {item.meal_menu}
                                        </p>
                                      )}
                                      {item.notes && (
                                        <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : quoteData?.schedules && quoteData.schedules.length > 0 ? (
                <div className="space-y-4">
                  {quoteData.schedules.map((schedule: any, index: number) => (
                    <div
                      key={index}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        selectedDay === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          index === quoteData.schedules.length - 1 ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                          'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}>
                          D{schedule.day}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {formatDateShort(schedule.date)}
                            </h3>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                              selectedDay === index ? 'rotate-90' : ''
                            }`} />
                          </div>
                          
                          {schedule.title && (
                            <p className="text-gray-700 font-medium mb-2">{schedule.title}</p>
                          )}
                          
                          {/* 일정 하이라이트 아이콘 */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {index === 0 && (
                              <>
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                                  <Bus className="w-3 h-3" /> 출발
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                                  <Home className="w-3 h-3" /> 체크인
                                </span>
                              </>
                            )}
                            {schedule.description?.includes('골프') && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs">
                                <Flag className="w-3 h-3" /> 골프
                              </span>
                            )}
                            {schedule.description?.includes('관광') && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                                <Camera className="w-3 h-3" /> 관광
                              </span>
                            )}
                            {index === quoteData.schedules.length - 1 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                                <Home className="w-3 h-3" /> 도착
                              </span>
                            )}
                          </div>
                          
                          {selectedDay === index && schedule.description && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-gray-600 whitespace-pre-wrap">{schedule.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>상세 일정은 담당자와 상의 후 확정됩니다.</p>
                </div>
              )}
            </div>

            {/* 포함/불포함 사항 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  포함 사항
                </h3>
                <ul className="space-y-2">
                  {(quoteData?.includeExclude?.includes || [
                    '왕복 전용버스',
                    '그린피 및 카트비',
                    `숙박 (${duration.nights}박)`,
                    '조식 제공'
                  ]).map((item, index) => (
                    item && (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          {item.includes('숙박') && !item.includes('(') ? `${item} (${duration.nights}박)` : item}
                        </span>
                      </li>
                    )
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gray-600" />
                  불포함 사항
                </h3>
                <ul className="space-y-2">
                  {(quoteData?.includeExclude?.excludes || [
                    '개인 경비',
                    '캐디피',
                    '중식 및 석식',
                    '여행자 보험'
                  ]).map((item, index) => (
                    item && (
                      <li key={index} className="flex items-start gap-2">
                        <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 오른쪽: 요약 정보 */}
          <div className="space-y-6">
            {/* 가격 정보 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">견적 요약</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">1인 요금</span>
                  <span className="text-xl font-bold">{quote.price.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">인원</span>
                  <span className="text-xl font-bold">{quoteData?.participants?.estimated_count || quote.max_participants}명</span>
                </div>
                <div className="border-t border-blue-400 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">총 예상 금액</span>
                    <span className="text-2xl font-bold">
                      {((quoteData?.participants?.estimated_count || quote.max_participants) * quote.price).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
                <p className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    견적 유효기간: {formatDate(quote.quote_expires_at)}까지
                  </span>
                </p>
              </div>
            </div>

            {/* 고객 정보 */}
            {quote.customer_name && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">예약 정보</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">예약자명</p>
                    <p className="font-medium text-gray-900">{quote.customer_name}님</p>
                  </div>
                  {quoteData?.participants?.group_name && (
                    <div>
                      <p className="text-sm text-gray-500">단체명</p>
                      <p className="font-medium text-gray-900">{quoteData.participants.group_name}</p>
                    </div>
                  )}
                  {quoteData?.participants?.leader_name && (
                    <div>
                      <p className="text-sm text-gray-500">총무</p>
                      <p className="font-medium text-gray-900">{quoteData.participants.leader_name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 문의하기 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">문의하기</h3>
              <p className="text-sm text-gray-600 mb-4">
                견적에 대해 궁금하신 점이 있으시면 언제든 연락주세요.
              </p>
              <div className="space-y-3">
                <a href="tel:031-215-3990" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">031-215-3990</p>
                    <p className="text-xs text-gray-500">평일 09:00 - 18:00</p>
                  </div>
                </a>
                <a href="mailto:singsinggolf@naver.com" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">singsinggolf@naver.com</p>
                    <p className="text-xs text-gray-500">24시간 접수 가능</p>
                  </div>
                </a>
              </div>
            </div>

            {/* 예약 진행 버튼 */}
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
              예약 진행하기
            </button>
          </div>
        </div>

        {/* 추가 안내사항 */}
        {quote.quote_notes && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              추가 안내사항
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.quote_notes}</p>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">싱싱골프투어</h4>
              <p className="text-gray-400 text-sm">
                고품격 골프 여행의 시작,<br />
                싱싱골프투어가 함께합니다.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">운영시간</h4>
              <p className="text-gray-400 text-sm">
                평일: 09:00 - 18:00<br />
                토요일: 09:00 - 13:00<br />
                일요일/공휴일: 휴무
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">연락처</h4>
              <p className="text-gray-400 text-sm">
                전화: 031-215-3990<br />
                이메일: singsinggolf@naver.com<br />
                카카오톡: @싱싱골프투어
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 싱싱골프투어. All rights reserved.</p>
            <p className="mt-2">본 견적서는 싱싱골프투어에서 발행한 공식 견적서입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}