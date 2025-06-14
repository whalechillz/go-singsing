import React from 'react';

interface TourFilterProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const TourFilter: React.FC<TourFilterProps> = ({ selectedFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: '전체' },
    { id: 'thisMonth', label: '이번달' },
    { id: 'nextMonth', label: '다음달' },
    { id: '2nights', label: '2박3일' },
    { id: '3nights', label: '3박4일' },
  ];

  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 py-3 overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap transition text-base font-medium ${
                selectedFilter === filter.id
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourFilter;
