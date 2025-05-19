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
  included?: string;
  not_included?: string;
};

type Props = {
  product: Product | null;
  tour: Tour | null;
};

const rows = [
  { label: "상품명", get: (p: any, t: any) => p?.name || t?.title, strong: true },
  { label: "일정", get: (p: any, t: any) => t?.start_date && t?.end_date ? `${t.start_date} ~ ${t.end_date}` : "-" },
  { label: "골프장", get: (p: any, t: any) => p?.golf_course || t?.golf_course || "-" },
  { label: "숙소", get: (p: any, t: any) => p?.accommodation || t?.accommodation || "-" },
  { label: "포함 사항", get: (p: any, t: any) => t?.included || "-" },
  { label: "불포함 사항", get: (p: any, t: any) => t?.not_included || "-" },
];

const ProductInfoBox: React.FC<Props> = ({ product, tour }) => {
  if (!product && !tour) return null;
  return (
    <div className="mb-6">
      <div className="section-title text-lg font-bold mb-2 text-blue-900 border-b-2 border-blue-800 pb-1">상품 정보</div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg border border-gray-200">
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <td className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 w-32 align-top whitespace-nowrap">{row.label}</td>
                <td className={`px-4 py-3 text-gray-900 ${row.strong ? "font-bold" : ""}`}>{row.get(product, tour)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductInfoBox; 