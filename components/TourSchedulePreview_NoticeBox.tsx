import React from "react";

type Props = { notices: string[] };

const NoticeBox: React.FC<Props> = ({ notices }) => {
  if (!notices?.length) return null;
  return (
    <div className="mb-6">
      <div className="notice-title font-bold text-blue-800 mb-2">예약 안내 사항</div>
      <div className="rounded-lg bg-blue-50 border-l-4 border-blue-400 p-4">
        <ul className="list-none pl-0">
          {notices.map((n, i) => (
            <li key={i} className="flex items-start mb-1 text-gray-700 text-sm">
              <span className="mr-2 text-blue-500">•</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NoticeBox; 