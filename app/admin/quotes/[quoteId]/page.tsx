"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  DollarSign,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  FileText,
  ArrowUpRight,
  Download,
  Eye,
  Copy
} from 'lucide-react';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.quoteId as string;
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [converting, setConverting] = useState(false);

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
        .single();
      
      if (quoteError) throw quoteError;
      
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

  const handleDelete = async () => {
    if (!window.confirm("정말 이 견적을 삭제하시겠습니까?")) return;
    
    try {
      const { error } = await supabase
        .from("singsing_tours")
        .delete()
        .eq("id", quoteId);
        
      if (error) throw error;
      
      alert("견적이 삭제되었습니다.");
      router.push("/admin/quotes");
    } catch (err: any) {
      alert("삭제 실패: " + err.message);
    }
  };

  const handleConvertToTour = async () => {
    if (!window.confirm("이 견적을 정식 투어로 전환하시겠습니까?")) return;
    
    setConverting(true);
    try {
      // 1. 투어 상태 변경
      const { error: updateError } = await supabase
        .from("singsing_tours")
        .update({ 
          status: 'confirmed',
          converted_at: new Date().toISOString()
        })
        .eq("id", quoteId);
        
      if (updateError) throw updateError;
      
      // 2. 일정 데이터 생성
      if (quoteData?.schedules) {
        for (const schedule of quoteData.schedules) {
          const { error: scheduleError } = await supabase
            .from("singsing_schedules")
            .insert({
              tour_id: quoteId,
              day_number: schedule.day,
              schedule_date: schedule.date,
              title: schedule.title || `Day ${schedule.day}`,
              description: schedule.description,
              meal_breakfast: false,
              meal_lunch: false,
              meal_dinner: false
            });
          
          if (scheduleError) console.error('일정 생성 오류:', scheduleError);
        }
      }
      
      // 3. 총무 정보를 참가자로 추가 (원하는 경우)
      if (quoteData?.participants && quoteData.participants.leader_name) {
        const { error: participantError } = await supabase
          .from("singsing_participants")
          .insert({
            tour_id: quoteId,
            name: quoteData.participants.leader_name,
            phone: quoteData.participants.leader_phone || '',
            team_name: quoteData.participants.group_name || '',
            role: '총무',
            status: 'confirmed',
            group_size: 1,
            is_paying_for_group: true,
            companions: []
          });
        
        if (participantError) console.error('참가자 생성 오류:', participantError);
      }
      
      alert("견적이 투어로 전환되었습니다. 일정과 참가자 정보가 함께 이동되었습니다.");
      router.push(`/admin/tours/${quoteId}`);
    } catch (err: any) {
      alert("전환 실패: " + err.message);
    } finally {
      setConverting(false);
    }
  };

  const copyQuoteLink = () => {
    const link = `${window.location.origin}/quote/${quoteId}`;
    navigator.clipboard.writeText(link);
    alert('견적서 링크가 복사되었습니다.');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Link href="/admin/quotes" className="mt-4 inline-block text-blue-600 hover:underline">
          견적 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">견적을 찾을 수 없습니다.</p>
        <Link href="/admin/quotes" className="mt-4 inline-block text-blue-600 hover:underline">
          견적 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR');
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
    if (daysUntilExpiry <= 3) return 'expiring_soon';
    return 'active';
  };

  const status = getQuoteStatus();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/quotes"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{quote.title}</h1>
            <p className="text-gray-600 mt-1">
              작성일: {formatDate(quote.quoted_at || quote.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={copyQuoteLink}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            링크 복사
          </button>
          <Link
            href={`/quote/${quoteId}`}
            target="_blank"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </Link>
          <Link
            href={`/admin/quotes/${quoteId}/edit`}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
          <button
            onClick={handleConvertToTour}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={converting}
          >
            <ArrowUpRight className="w-4 h-4" />
            {converting ? '전환 중...' : '투어로 전환'}
          </button>
        </div>
      </div>

      {/* 상태 표시 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">견적 상태</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {status === 'active' && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">유효한 견적</span>
              </div>
            )}
            {status === 'expiring_soon' && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-600 font-medium">만료 임박</span>
              </div>
            )}
            {status === 'expired' && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">만료됨</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            유효기간: {formatDate(quote.quote_expires_at)}까지
          </div>
        </div>
      </div>

      {/* 고객 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">고객 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">고객명</label>
            <p className="font-medium">{quote.customer_name || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">연락처</label>
            <p className="font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {quote.customer_phone || '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">이메일</label>
            <p className="font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {quote.customer_email || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 투어 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">투어 정보</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">투어 상품</label>
              <p className="font-medium">{quote.product?.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">골프장</label>
              <p className="font-medium">{quote.product?.golf_course || '-'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">출발일</label>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(quote.start_date)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">도착일</label>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(quote.end_date)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">일정</label>
              <p className="font-medium">{calculateDays()}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">인원</label>
              <p className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                {quote.max_participants}명
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 금액 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">금액 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">1인 금액</label>
            <p className="font-medium text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              {quote.price.toLocaleString()}원
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">총 인원</label>
            <p className="font-medium text-lg">{quote.max_participants}명</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">총액</label>
            <p className="font-medium text-xl text-blue-600">
              {(quote.price * quote.max_participants).toLocaleString()}원
            </p>
          </div>
        </div>
      </div>

      {/* 일정 정보 */}
      {quoteData?.schedules && quoteData.schedules.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">일정 정보</h3>
          <div className="space-y-3">
            {quoteData.schedules.map((schedule: any, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium text-gray-900">
                  Day {schedule.day} - {new Date(schedule.date).toLocaleDateString('ko-KR')}
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
            ))}
          </div>
        </div>
      )}

      {/* 참가자 정보 */}
      {quoteData?.participants && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">참가자 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quoteData.participants.group_name && (
              <div>
                <label className="text-sm text-gray-600">모임명</label>
                <p className="font-medium">{quoteData.participants.group_name}</p>
              </div>
            )}
            {quoteData.participants.estimated_count > 0 && (
              <div>
                <label className="text-sm text-gray-600">예상 인원</label>
                <p className="font-medium">{quoteData.participants.estimated_count}명</p>
              </div>
            )}
            {quoteData.participants.leader_name && (
              <div>
                <label className="text-sm text-gray-600">총무 성명</label>
                <p className="font-medium">{quoteData.participants.leader_name}</p>
              </div>
            )}
            {quoteData.participants.leader_phone && (
              <div>
                <label className="text-sm text-gray-600">총무 연락처</label>
                <p className="font-medium">{quoteData.participants.leader_phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 추가 정보 */}
      {quote.quote_notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">추가 정보</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{quote.quote_notes}</p>
        </div>
      )}
    </div>
  );
}