"use client";
import { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Phone, 
  ChevronRight,
  Check,
  Clock,
  DollarSign,
  Bus,
  Hotel,
  Utensils,
  FileText,
  Download
} from 'lucide-react';
import { TourMarketingSection } from '@/components/marketing/SingSingMarketingDisplay';

interface Attraction {
  id: string;
  name: string;
  description: string;
  main_image_url: string | null;
  category: string;
  recommended_duration?: number;
}

interface AttractionOption {
  id: string;
  schedule_id: string;
  attraction_id: string;
  additional_price: number;
  is_default: boolean;
  order_no: number;
  attraction?: Attraction;
}

interface Schedule {
  id: string;
  day_number: number;
  date: string;
}

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  schedules?: Schedule[];
}

interface Promo {
  id: string;
  tour_id: string;
  slug: string;
  is_public: boolean;
  valid_until: string | null;
  main_image_url: string | null;
  tour: Tour;
}

interface DocumentLink {
  id: string;
  tour_id: string;
  document_type: string;
  access_token: string;
  is_active: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}

interface TourPromotionClientProps {
  promo: Promo;
  attractionOptions: AttractionOption[];
  documentLinks?: DocumentLink[];
}

export default function TourPromotionClient({ promo, attractionOptions, documentLinks = [] }: TourPromotionClientProps) {
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const tour = promo.tour;
  
  // 일정별로 관광지 옵션 그룹화
  const optionsBySchedule = attractionOptions.reduce((acc, option) => {
    const scheduleId = option.schedule_id;
    if (!acc[scheduleId]) {
      acc[scheduleId] = [];
    }
    acc[scheduleId].push(option);
    return acc;
  }, {} as { [key: string]: AttractionOption[] });

  // 총 추가 요금 계산
  const calculateTotalPrice = () => {
    return Object.values(selectedOptions).reduce((total: number, optionId: string) => {
      const option = attractionOptions.find((opt: AttractionOption) => opt.id === optionId);
      return total + (option?.additional_price || 0);
    }, 0);
  };

  const handleOptionSelect = (scheduleId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [scheduleId]: optionId
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <div className="relative h-[50vh] min-h-[400px] bg-gradient-to-br from-blue-600 to-blue-800">
        {promo.main_image_url && (
          <img 
            src={promo.main_image_url} 
            alt={tour.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative h-full flex items-center justify-center text-white px-4">
          <div className="text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              싱싱골프투어
            </h1>
            <h2 className="text-2xl md:text-3xl mb-6">
              {tour.title}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(tour.start_date).toLocaleDateString('ko-KR')} - {new Date(tour.end_date).toLocaleDateString('ko-KR')}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {getDuration(tour.start_date, tour.end_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 투어 하이라이트 */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">투어 특징</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bus className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">편안한 이동</h4>
              <p className="text-gray-600">전용 버스로 편안하게 이동합니다</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hotel className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">프리미엄 숙박</h4>
              <p className="text-gray-600">엄선된 골프텔에서의 편안한 휴식</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">맛있는 식사</h4>
              <p className="text-gray-600">지역 특색있는 맛집에서의 식사</p>
            </div>
          </div>
        </div>
      </div>

      {/* 마케팅 콘텐츠 (포함사항, 특별혜택, 불포함사항) */}
      <TourMarketingSection 
        tourId={tour.id}
        tourProductId={(tour as any).tour_product_id}
      />

      {/* 일정 및 관광지 옵션 */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">일정별 관광 옵션</h3>
          
          <div className="space-y-8">
            {tour.schedules?.map((schedule) => {
              const options = optionsBySchedule[schedule.id] || [];
              if (options.length === 0) return null;

              return (
                <div key={schedule.id} className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Day {schedule.day_number} - {new Date(schedule.date).toLocaleDateString('ko-KR', { 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {options.map((option) => {
                      const isSelected = selectedOptions[schedule.id] === option.id;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(schedule.id, option.id)}
                          className={`relative p-4 rounded-lg border-2 transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          {option.attraction?.main_image_url && (
                            <img 
                              src={option.attraction.main_image_url}
                              alt={option.attraction.name}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          
                          <h5 className="font-semibold mb-1">{option.attraction?.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">
                            {option.attraction?.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              <Clock className="w-4 h-4 inline mr-1" />
                              약 {option.attraction?.recommended_duration || 60}분
                            </span>
                            <span className={`font-semibold ${
                              option.additional_price > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {option.additional_price > 0 
                                ? `+${option.additional_price.toLocaleString()}원`
                                : option.is_default ? '기본' : '무료'
                              }
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 총 추가 요금 */}
          {calculateTotalPrice() > 0 && (
            <div className="mt-8 bg-yellow-50 rounded-lg p-6 text-center">
              <p className="text-lg">
                선택하신 옵션의 추가 요금: 
                <span className="font-bold text-2xl text-red-600 ml-2">
                  {calculateTotalPrice().toLocaleString()}원
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 문서 다운로드 섹션 */}
      {documentLinks.length > 0 && (
        <div className="bg-gray-100 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-8">투어 관련 문서</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentLinks.map((link) => {
                const documentTypeLabels: { [key: string]: string } = {
                  'customer_schedule': '고객용 일정표',
                  'staff_schedule': '스탭용 일정표',
                  'boarding_guide': '탑승 안내',
                  'customer_boarding': '고객용 탑승안내',
                  'staff_boarding': '스탭용 탑승안내'
                };
                
                return (
                  <a
                    key={link.id}
                    href={`/doc/${link.access_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex items-center gap-4 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {documentTypeLabels[link.document_type] || link.document_type}
                      </h4>
                      <p className="text-sm text-gray-500">
                        클릭하여 보기
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CTA 섹션 */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            지금 바로 예약하세요!
          </h3>
          <p className="text-xl mb-8">
            싱싱골프투어와 함께 잊지 못할 추억을 만들어보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:010-1234-5678"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5" />
              전화 문의하기
            </a>
            <button
              onClick={() => {
                const message = `${tour.title} 예약 문의드립니다.\n선택한 관광지 옵션:\n${
                  Object.entries(selectedOptions).map(([scheduleId, optionId]: [string, string]) => {
                    const option = attractionOptions.find((opt: AttractionOption) => opt.id === optionId);
                    return `- ${option?.attraction?.name}${option?.additional_price ? ` (+${option.additional_price.toLocaleString()}원)` : ''}`;
                  }).join('\n')
                }\n총 추가요금: ${calculateTotalPrice().toLocaleString()}원`;
                
                window.open(`https://wa.me/821012345678?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              카톡으로 문의하기
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 헬퍼 함수
function getDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const nights = days - 1;
  return `${nights}박 ${days}일`;
}