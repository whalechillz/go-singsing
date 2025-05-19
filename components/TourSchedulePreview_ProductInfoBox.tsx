import React from "react";

type Tour = {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  golf_course?: string;
  accommodation?: string;
  includes?: string;
  excludes?: string;
};

type Props = {
  product?: null;
  tour: Tour | null;
};

const rows = [
  { label: "상품명", get: (t: any) => t?.title, strong: true },
  { label: "일정", get: (t: any) => t?.start_date && t?.end_date ? `${t.start_date} ~ ${t.end_date}` : "-" },
  { label: "골프장", get: (t: any) => t?.golf_course || "-" },
  { label: "숙소", get: (t: any) => t?.accommodation || "-" },
  { label: "포함 사항", get: (t: any) => t?.includes || "-" },
  { label: "불포함 사항", get: (t: any) => t?.excludes || "-" },
];

const ProductInfoBox: React.FC<Props> = ({ tour }) => {
  if (!tour) return null;
  return (
    <div className="mb-6">
      <div className="section-title text-lg font-bold mb-2 text-blue-900 border-b-2 border-blue-800 pb-1">상품 정보</div>
      <div className="overflow-x-auto max-w-4xl w-full">
        <table className="min-w-full w-full bg-white rounded-lg border border-gray-200">
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <td className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 w-32 align-top whitespace-nowrap">{row.label}</td>
                <td className={`px-4 py-3 text-gray-900 ${row.strong ? "font-bold" : ""}`}>{row.get(tour)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductInfoBox; 