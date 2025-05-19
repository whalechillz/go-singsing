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
  notice?: string[];
};

type Props = { tour: Tour };

const TourInfoBox: React.FC<Props> = ({ tour }) => {
  if (!tour) return null;
  return (
    <div className="mb-6">
      <div className="section-title text-lg font-bold mb-2 text-blue-900 border-b-2 border-blue-800 pb-1">상품 정보</div>
      <div className="overflow-x-auto max-w-4xl w-full mb-4">
        <table className="min-w-full w-full bg-white rounded-lg border border-gray-200">
          <tbody>
            <tr className="border-b">
              <td className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 w-32 align-top whitespace-nowrap">상품명</td>
              <td className="px-4 py-3 text-gray-900 font-bold">{tour.title}</td>
            </tr>
            <tr className="border-b">
              <td className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 w-32 align-top whitespace-nowrap">일정</td>
              <td className="px-4 py-3 text-gray-900">{tour.start_date} ~ {tour.end_date}</td>
            </tr>
            <tr className="border-b">
              <td className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 w-32 align-top whitespace-nowrap">골프장</td>
              <td className="px-4 py-3 text-gray-900">{tour.golf_course || "-"}</td>
            </tr>
            <tr className="border-b">
              <td className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 w-32 align-top whitespace-nowrap">숙소</td>
              <td className="px-4 py-3 text-gray-900">{tour.accommodation || "-"}</td>
            </tr>
            {tour.includes && (
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 w-32 align-top whitespace-nowrap">포함 사항</td>
                <td className="px-4 py-3 text-gray-900">{tour.includes}</td>
              </tr>
            )}
            {tour.excludes && (
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 w-32 align-top whitespace-nowrap">불포함 사항</td>
                <td className="px-4 py-3 text-gray-900">{tour.excludes}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {tour.notice && tour.notice.length > 0 && (
        <div className="mb-6">
          <div className="notice-title font-bold text-blue-800 mb-2">예약 안내 사항</div>
          <div className="rounded-lg bg-blue-50 border-l-4 border-blue-400 p-4">
            <ul className="list-none pl-0">
              {tour.notice.map((n, i) => (
                <li key={i} className="flex items-start mb-1 text-gray-700 text-sm">
                  <span className="mr-2 text-blue-500">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourInfoBox; 