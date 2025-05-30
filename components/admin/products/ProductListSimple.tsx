"use client";
import React from 'react';
import Link from 'next/link';

interface TourProduct {
  id: string;
  name: string;
  golf_course?: string;
  hotel?: string;
}

interface ProductListSimpleProps {
  products: TourProduct[];
  loading: boolean;
  error: string;
  onDelete: (id: string) => void;
}

const ProductListSimple: React.FC<ProductListSimpleProps> = ({
  products,
  loading,
  error,
  onDelete
}) => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-end">
          <Link
            href="/admin/tour-products/new"
            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
          >
            + 여행상품 등록
          </Link>
        </div>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="mt-2 text-gray-500">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">등록된 여행상품이 없습니다.</p>
            <Link
              href="/admin/tour-products/new"
              className="inline-block px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
            >
              첫 상품 등록하기
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">상품명</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">골프장</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">숙소</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">일정</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.golf_course || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.hotel || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">
                    <Link
                      href={`/admin/tours?product=${product.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      일정
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/admin/tour-products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        수정
                      </Link>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 hover:text-red-800 hover:underline text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductListSimple;