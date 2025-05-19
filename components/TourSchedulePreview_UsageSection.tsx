import React from "react";

type Usage = { title: string; items: string[] };
type Props = { usage: Usage[] };

const UsageSection: React.FC<Props> = ({ usage }) => {
  if (!usage?.length) return null;
  return (
    <div className="mb-6">
      <div className="section-title text-lg font-bold mb-2 text-blue-900 border-b-2 border-blue-800 pb-1">이용 안내</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {usage.map((u, i) => (
          <div key={i} className="usage-card bg-white border border-gray-200 rounded-lg shadow p-4">
            <div className="usage-header font-bold text-blue-700 mb-2">{u.title}</div>
            <ul className="list-disc pl-5 text-gray-700 text-sm">
              {u.items.map((item, idx) => (
                <li key={idx} className="mb-1">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageSection; 