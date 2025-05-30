"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Hotel,
  Tag,
  TrendingUp,
  Package,
  MoreVertical
} from 'lucide-react';

interface TourProduct {
  id: string;
  name: string;
  description?: string;
  golf_course?: string;
  hotel?: string;
  date?: string;
  price?: number;
  duration?: string;
  min_participants?: number;
  max_participants?: number;
  image_url?: string;
  rating?: number;
  total_bookings?: number;
  is_active?: boolean;
  category?: string;
  tags?: string[];
}

interface ProductListEnhancedProps {
  products: TourProduct[];
  loading: boolean;
  error: string;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const ProductListEnhanced: React.FC<ProductListEnhancedProps> = ({
  products,
  loading,
  error,
  onDelete,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // 필터링된 상품
  const filteredProducts = products.filter(product => {
    // 검색어 필터
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!product.name.toLowerCase().includes(search) &&
          !product.golf_course?.toLowerCase().includes(search) &&
          !product.hotel?.toLowerCase().includes(search)) {
        return false;
      }
    }

    // 카테고리 필터
    if (categoryFilter !== 'all' && product.category !== categoryFilter) {
      return false;
    }

    // 가격 필터
    if (product.price && (product.price < priceRange[0] || product.price > priceRange[1])) {
      return false;
    }

    return true;
  });

  // 통계 정보
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active !== false).length,
    totalBookings: products.reduce((sum, p) => sum + (p.total_bookings || 0), 0),
    averagePrice: products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length || 0
  };

  const formatPrice = (price?: number) => {
    if (!price) return '가격 미정';
    return `${price.toLocaleString()}원`;
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">여행상품 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {stats.totalProducts}개 상품 | 활성 {stats.activeProducts}개
          </p>
        </div>
        <Link
          href="/admin/tour-products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          새 상품 등록
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 상품</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 상품</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 예약</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 가격</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats.averagePrice).toLocaleString()}원
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="상품명, 골프장, 호텔로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 필터 및 뷰 모드 */}
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">모든 카테고리</option>
              <option value="domestic">국내</option>
              <option value="overseas">해외</option>
              <option value="package">패키지</option>
              <option value="custom">맞춤형</option>
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                그리드
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                리스트
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 상품 목록 */}
      {loading ? (
        <div className="bg-white rounded-lg p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">상품 목록을 불러오는 중...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg p-12">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg p-12">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">등록된 상품이 없습니다.</p>
            <Link
              href="/admin/tour-products/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 상품 등록하기
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* 상품 이미지 */}
              <div className="relative h-48 bg-gray-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {product.is_active === false && (
                  <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                    비활성
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === product.id ? null : product.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {showDropdown === product.id && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <Link
                            href={`/admin/tour-products/${product.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 inline mr-2" />
                            상세보기
                          </Link>
                          <Link
                            href={`/admin/tour-products/${product.id}/edit`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 inline mr-2" />
                            수정
                          </Link>
                          <button
                            onClick={() => {
                              setShowDropdown(null);
                              onDelete(product.id);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 골프장 & 호텔 */}
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  {product.golf_course && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {product.golf_course}
                    </div>
                  )}
                  {product.hotel && (
                    <div className="flex items-center gap-1">
                      <Hotel className="w-4 h-4" />
                      {product.hotel}
                    </div>
                  )}
                </div>

                {/* 평점 */}
                {renderRating(product.rating)}

                {/* 가격 및 예약 정보 */}
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                    {product.duration && (
                      <p className="text-sm text-gray-500">{product.duration}</p>
                    )}
                  </div>
                  {product.total_bookings !== undefined && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">예약</p>
                      <p className="font-semibold">{product.total_bookings}건</p>
                    </div>
                  )}
                </div>

                {/* 태그 */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  골프장
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  숙소
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예약
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.duration && (
                          <div className="text-sm text-gray-500">{product.duration}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.golf_course || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.hotel || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.total_bookings || 0}건
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.is_active === false ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        비활성
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        활성
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/tour-products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductListEnhanced;