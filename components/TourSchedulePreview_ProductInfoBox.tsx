import React from "react";

type Product = {
  id: string;
  name: string;
  description?: string;
  golf_course?: string;
  accommodation?: string;
  included?: string;
  not_included?: string;
};

type Tour = {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  golf_course?: string;
  accommodation?: string;
};

type Props = {
  product: Product | null;
  tour: Tour | null;
};

const ProductInfoBox: React.FC<Props> = ({ product, tour }) => {
  if (!product && !tour) return null;
  return (
    <div className="mb-6">
      <div className="section-title text-lg font-bold mb-2 text-blue-900 border-b-2 border-blue-800 pb-1">상품 정보</div>
      <div className="rounded-lg overflow-hidden shadow border border-gray-200 bg-white">
        <div className="flex flex-col divide-y divide-gray-100">
          <div className="flex">
            <div className="w-28 bg-gray-50 px-4 py-3 font-semibold text-gray-700">상품명</div>
            <div className="flex-1 px-4 py-3 text-gray-900 font-bold">{product?.name || tour?.title}</div>
          </div>
          <div className="flex">
            <div className="w-28 bg-gray-50 px-4 py-3 font-semibold text-gray-700">일정</div>
            <div className="flex-1 px-4 py-3">{tour?.start_date} ~ {tour?.end_date}</div>
          </div>
          <div className="flex">
            <div className="w-28 bg-gray-50 px-4 py-3 font-semibold text-gray-700">골프장</div>
            <div className="flex-1 px-4 py-3">{product?.golf_course || tour?.golf_course || '-'}</div>
          </div>
          <div className="flex">
            <div className="w-28 bg-gray-50 px-4 py-3 font-semibold text-gray-700">숙소</div>
            <div className="flex-1 px-4 py-3">{product?.accommodation || tour?.accommodation || '-'}</div>
          </div>
          <div className="flex">
            <div className="w-28 bg-gray-50 px-4 py-3 font-semibold text-gray-700">포함 사항</div>
            <div className="flex-1 px-4 py-3">{product?.included || '-'}</div>
          </div>
          <div className="flex">
            <div className="w-28 bg-gray-50 px-4 py-3 font-semibold text-gray-700">불포함 사항</div>
            <div className="flex-1 px-4 py-3">{product?.not_included || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoBox; 