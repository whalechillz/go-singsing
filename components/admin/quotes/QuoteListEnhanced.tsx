"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { 
  Search, 
  Plus,
  Calendar, 
  Users, 
  DollarSign, 
  MoreVertical,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

interface Quote {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
  max_participants: number;
  current_participants?: number;
  status?: string;
  golf_course?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  quote_expires_at?: string;
  quoted_at?: string;
}

interface QuoteListEnhancedProps {
  quotes: Quote[];
  loading: boolean;
  error: string;
  onDelete: (id: string) => void;
  onConvertToTour: (id: string) => void;
  onRefresh: () => void;
}

const QuoteListEnhanced: React.FC<QuoteListEnhancedProps> = ({ 
  quotes, 
  loading, 
  error, 
  onDelete,
  onConvertToTour,
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // 견적 만료 상태 계산
  const getQuoteStatus = (quote: Quote) => {
    if (!quote.quote_expires_at) return 'active';
    
    const today = new Date();
    const expiryDate = new Date(quote.quote_expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring_soon';
    return 'active';
  };

  // 상태별 배지
  const getStatusBadge = (quote: Quote) => {
    const status = getQuoteStatus(quote);
    
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            유효
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3" />
            만료 임박
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            만료됨
          </span>
        );
      default:
        return null;
    }
  };

  // 필터링된 견적 목록
  const filteredQuotes = quotes.filter(quote => {
    if (searchTerm && !quote.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !quote.customer_phone?.includes(searchTerm) &&
        !quote.golf_course?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 통계 정보
  const stats = {
    total: quotes.length,
    active: quotes.filter(q => getQuoteStatus(q) === 'active').length,
    expiringSoon: quotes.filter(q => getQuoteStatus(q) === 'expiring_soon').length,
    expired: quotes.filter(q => getQuoteStatus(q) === 'expired').length,
    totalValue: quotes.reduce((sum, q) => sum + (q.price * (q.max_participants || 0)), 0)
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적 관리</h1>
          <p className="text-gray-600 mt-1">고객에게 제공한 투어 견적을 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRefresh}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
          <Link 
            href="/admin/quotes/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 견적 작성
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 견적</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">유효한 견적</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">만료 임박</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">예상 매출</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalValue.toLocaleString()}원
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="견적명, 고객명, 전화번호, 골프장으로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 견적 목록 */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">견적 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
            <button 
              onClick={onRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">작성된 견적이 없습니다.</p>
            <Link 
              href="/admin/quotes/new"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 견적 작성하기
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    견적 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    일정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    인원/금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    유효기간
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link 
                          href={`/admin/quotes/${quote.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {quote.title}
                        </Link>
                        {quote.golf_course && (
                          <div className="text-sm text-gray-500 mt-1">
                            {quote.golf_course}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{quote.customer_name || '-'}</div>
                        {quote.customer_phone && (
                          <div className="text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {quote.customer_phone}
                          </div>
                        )}
                        {quote.customer_email && (
                          <div className="text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {quote.customer_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(quote.start_date)} - {formatDate(quote.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Users className="w-4 h-4" />
                          {quote.max_participants}명
                        </div>
                        <div className="text-gray-500 mt-1">
                          {quote.price.toLocaleString()}원
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quote)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {quote.quote_expires_at ? new Date(quote.quote_expires_at).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative flex items-center justify-end">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2 flex items-center gap-1"
                          onClick={() => onConvertToTour(quote.id)}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          투어 전환
                        </button>
                        <button
                          onClick={() => setShowDropdown(showDropdown === quote.id ? null : quote.id)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {showDropdown === quote.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1">
                              <Link
                                href={`/admin/quotes/${quote.id}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(null)}
                              >
                                상세보기
                              </Link>
                              <Link
                                href={`/admin/quotes/${quote.id}/edit`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(null)}
                              >
                                수정
                              </Link>
                              <Link
                                href={`/admin/quotes/${quote.id}/preview`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(null)}
                              >
                                견적서 미리보기
                              </Link>
                              <button
                                onClick={() => {
                                  setShowDropdown(null);
                                  navigator.clipboard.writeText(`${window.location.origin}/quote/${quote.id}`);
                                  alert('견적서 링크가 복사되었습니다.');
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                링크 복사
                              </button>
                              <button
                                onClick={() => {
                                  setShowDropdown(null);
                                  onDelete(quote.id);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteListEnhanced;