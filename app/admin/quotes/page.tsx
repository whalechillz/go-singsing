"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Search, Calendar, Users, DollarSign, Copy, Send, Eye, Edit, Trash2, Clock, Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generatePublicUrl, getPublicLinkUrl } from "@/utils/publicLink";

interface Quote {
  id: string;
  title: string;
  customer_name: string | null;
  customer_phone: string | null;
  start_date: string;
  end_date: string;
  price: number;
  max_participants: number;
  quote_expires_at: string | null;
  quote_data: any;
  created_at: string;
  updated_at: string;
  tour_product_id: string | null;
  product?: any;
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  


  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      // quote_data가 null이 아닌 투어만 가져오기 (견적서로 사용)
      const { data, error } = await supabase
        .from("singsing_tours")
        .select(`
          *,
          product:tour_products(*)
        `)
        .not('quote_data', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setQuotes(data || []);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (quote: Quote) => {
    const isExpired = quote.quote_expires_at && new Date(quote.quote_expires_at) < new Date();
    
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
          <Clock className="w-3 h-3" />
          만료됨
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
        <Check className="w-3 h-3" />
        유효함
      </span>
    );
  };

  const handleCopyLink = async (quoteId: string) => {
    try {
      // 공개 링크 정보 가져오기
      const { data: linkData, error } = await supabase
        .from("public_document_links")
        .select("public_url")
        .eq("tour_id", quoteId)
        .eq("document_type", "quote")
        .eq("is_active", true)
        .single();

      let url;
      if (linkData?.public_url) {
        // 공개 링크가 있는 경우
        url = getPublicLinkUrl(linkData.public_url, true);  // 견적서는 /q/ 경로 사용
      } else {
        // 공개 링크가 없는 경우 생성
        const publicUrl = generatePublicUrl();
        const expiresAt = quotes.find(q => q.id === quoteId)?.quote_expires_at;
        
        const { error: createError } = await supabase
          .from("public_document_links")
          .insert({
            tour_id: quoteId,
            document_type: 'quote',
            public_url: publicUrl,
            expires_at: expiresAt,
            is_active: true,
            view_count: 0
          });
        
        if (createError) throw createError;
        url = getPublicLinkUrl(publicUrl, true);  // 견적서는 /q/ 경로 사용
      }
      
      await navigator.clipboard.writeText(url);
      alert('견적서 링크가 복사되었습니다.');
    } catch (error) {
      console.error("Error copying link:", error);
      alert('링크 복사 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (quoteId: string) => {
    if (!confirm('정말 이 견적서를 삭제하시겠습니까?')) return;

    try {
      // quote_data를 null로 업데이트하여 견적서에서 제외
      const { error } = await supabase
        .from("singsing_tours")
        .update({ 
          quote_data: null,
          quote_expires_at: null,
          customer_name: null,
          customer_phone: null
        })
        .eq('id', quoteId);

      if (error) throw error;
      
      fetchQuotes();
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert('견적서 삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.customer_name && quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === "all") return matchesSearch;
    
    const isExpired = quote.quote_expires_at && new Date(quote.quote_expires_at) < new Date();
    if (filterStatus === "expired" && isExpired) return matchesSearch;
    if (filterStatus === "valid" && !isExpired) return matchesSearch;
    
    return false;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calculateDays = (start: string, end: string) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days - 1}박 ${days}일`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">견적서 관리</h1>
        <p className="text-gray-600 mt-1">고객에게 발송할 견적서를 생성하고 관리합니다.</p>
      </div>

      {/* 상단 액션 바 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="견적서명, 고객명으로 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">전체 견적서</option>
            <option value="valid">유효한 견적서</option>
            <option value="expired">만료된 견적서</option>
          </select>

          <Link
            href="/admin/quotes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            새 견적서
          </Link>
        </div>
      </div>

      {/* 견적서 목록 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">견적서가 없습니다</h3>
            <p className="text-gray-500">새 견적서를 작성해보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    견적서 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    여행 일정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => {
                  const quoteData = typeof quote.quote_data === 'string' 
                    ? JSON.parse(quote.quote_data) 
                    : quote.quote_data;
                    
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/admin/quotes/${quote.id}/edit`} className="hover:text-blue-600">
                          <div>
                            <div className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">{quote.title}</div>
                            <div className="text-sm text-gray-500">
                              생성일: {formatDate(quote.created_at)}
                            </div>
                            {quote.quote_expires_at && (
                              <div className="text-sm text-gray-500">
                                만료일: {formatDate(quote.quote_expires_at)}
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {quote.customer_name ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{quote.customer_name}</div>
                            {quote.customer_phone && (
                              <div className="text-sm text-gray-500">{quote.customer_phone}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">미지정</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatDate(quote.start_date)} ~ {formatDate(quote.end_date)}
                          </div>
                          <div className="text-sm text-gray-500">{calculateDays(quote.start_date, quote.end_date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quote.price.toLocaleString()}원
                          </div>
                          <div className="text-sm text-gray-500">
                            {quoteData?.participants?.estimated_count || quote.max_participants}명 기준
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(quote)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => window.open(`/quote/${quote.id}`, '_blank')}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="미리보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopyLink(quote.id)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="링크 복사"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/quotes/${quote.id}/edit`)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(quote.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}